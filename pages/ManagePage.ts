import { Page, expect } from '@playwright/test';

export class Menu {
    constructor(public page: Page) { }

    async clickMenu(menuItem: string) {
        //await this.page.locator('.menu-item', { hasText: menuItem }).click();
        await this.page.getByRole("link", { name: menuItem }).click();
    }
}

export class TablePage {
    constructor(public page: Page) { }

    // async addTableGroup() {
    //     await this.page.locator().click();

    // }

    async addTable(tableName: string, tableGroup: string) {
        await this.page.locator('text="Thêm phòng/bàn"').click();
        await this.page.locator('input[ng-model="table.Name"]').fill(tableName);
        await this.page.locator('a[title="Thêm nhóm"]').click();
        await this.page.getByRole('dialog').locator('input[ng-model="group.Name"]').nth(0).fill(tableGroup);
        await this.page.getByRole('dialog').locator('a[ng-click="saveGroup()"]').click();
        await this.page.locator('a[ng-click="save()"]').click();
    }
}