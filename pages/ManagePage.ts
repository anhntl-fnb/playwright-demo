import { Page, expect } from '@playwright/test';

export class Menu {
    constructor(public page: Page) { }

    async clickMenu(menuItem: string) {
        await this.page.getByRole("link", { name: menuItem }).click();
    }
}

export class TablePage {
    constructor(public page: Page) { }

    async addTable(tableName: string, tableGroup: string) {
        await this.page.locator('text="Thêm phòng/bàn"').click();
        await this.page.locator('input[ng-model="table.Name"]').fill(tableName);
        await this.page.locator('a[title="Thêm nhóm"]').click();
        await this.page.getByRole('dialog').locator('input[ng-model="group.Name"]').nth(0).fill(tableGroup);
        await this.page.getByRole('dialog').locator('a[ng-click="saveGroup()"]').click();
        await this.page.locator('a[ng-click="save()"]').click();
        await expect(this.page.locator('td.cell-name span.ng-binding').nth(0)).toContainText(tableName);
    };

    async updateTable(tableName: string) {
        await this.page.locator('a:has-text("Cập nhật")').click();
        await this.page.locator('input[ng-model="table.Name"]').fill(tableName);
        await this.page.locator('a[ng-click="save()"]').click();
        await expect(this.page.locator('td.cell-name span.ng-binding').nth(0)).toContainText(tableName);
    }

    async deleteTable() {
        await this.page.locator('text=Xóa').nth(1).click();
        await this.page.getByRole('button', { name: 'Đồng ý' }).click();
    }
}

export class ProductPage {
    constructor(public page: Page) { }

    async addProduct(productName: string, category: string, price: number) {
        await this.page.locator('a:has-text("Thêm mới")').nth(0).click();
        await this.page.getByRole('link', { name: 'Thêm hàng hóa' }).click();
        await this.page.locator('input[ng-model="product.Name"]').fill(productName);
        await this.page.locator('a[ng-if="includeAdd"]').nth(0).click();
        await this.page.locator('input[ng-model="category.Name"]').nth(1).fill(category);
        const saveButtons = this.page.locator('a[ng-click="saveCategory()"]');
        for (let i = 0; i < await saveButtons.count(); i++) {
            if (await saveButtons.nth(i).isVisible()) {
                await saveButtons.nth(i).click();
                break;
            }
        }
        await this.page.waitForTimeout(1000);
        await this.page.locator('input[ng-model="product.BasePrice"]').fill(price.toString());
        await this.page.locator('a[ng-enter="SaveProduct()"]').click();
        await this.page.waitForTimeout(1000);
    }

    async updateProduct(productName: string, updatedProductName: string) {
        await this.page.locator('a.btn-mobile[ng-click="UpdateProduct(dataItem)"]:has-text("Cập nhật")').click();
        await this.page.locator('input[ng-model="product.Name"]').fill(updatedProductName);
        await this.page.locator('a[ng-enter="SaveProduct()"]').click();
    }

    async deleteProduct(productName: string) {
        await this.page.locator('a.btn-danger[ng-click="DeleteProduct(dataItem)"]:has-text("Xóa")').click();
        await this.page.getByRole('button', { name: 'Đồng ý' }).click();
    }
}