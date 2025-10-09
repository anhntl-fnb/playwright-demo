import { Page, Locator, expect } from '@playwright/test';

interface TableData {
    name: string;
    group: string;
    position?: number;
    seats?: number;
    description?: string;
}

interface TableElements {
    addTableButton: Locator;
    tableNameInput: Locator;
    groupDropdown: Locator;
    addGroupButton: Locator;
    groupNameInput: Locator;
    saveGroupButton: Locator;
    saveTableButton: Locator;
    cancelButton: Locator;
    tableWindow: Locator;
}

export class ManagementMenu {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async clickMenu(menuItem: string): Promise<void> {
        await this.page.getByRole('link', { name: menuItem }).click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async navigateToSection(section: string, subSection?: string): Promise<void> {
        await this.clickMenu(section);
        if (subSection) {
            await this.page.getByRole('link', { name: subSection }).click();
            await this.page.waitForLoadState('domcontentloaded');
        }
    }
}

export class TablePage {
    private readonly page: Page;
    private readonly elements: TableElements;

    constructor(page: Page) {
        this.page = page;

        // Initialize element selectors based on actual HTML structure
        this.elements = {
            addTableButton: page.locator('text="Thêm phòng/bàn"'),
            tableNameInput: page.locator('input[ng-model="table.Name"]'),
            groupDropdown: page.locator('[kendo-drop-down-list="ddlSelectGroup"]'),
            addGroupButton: page.locator('[kendo-window="tableWindow"] a[ng-click="AddGroup(0)"]'),
            groupNameInput: page.locator('[kv-name="tableGroupForm"] input[ng-model="group.Name"]'),
            saveGroupButton: page.locator('[kv-name="tableGroupForm"] a[ng-click="saveGroup()"]'),
            saveTableButton: page.locator('a[ng-click="save()"]'),
            cancelButton: page.locator('a[ng-click="cancel()"]'),
            tableWindow: page.locator('[kendo-window="tableWindow"]')
        };
    }

    async addTable(tableData: TableData): Promise<void> {
        // Click add table button
        await this.elements.addTableButton.click();

        // Wait for form to be visible
        await this.elements.tableWindow.waitFor({ state: 'visible' });

        // Fill table name
        await this.elements.tableNameInput.fill(tableData.name);

        // Create new group if provided
        if (tableData.group) {
            await this.createGroup(tableData.group);
        }

        // Fill optional fields if provided
        if (tableData.position !== undefined) {
            await this.page.locator('input[ng-model="table.Position"]').fill(tableData.position.toString());
        }

        if (tableData.seats !== undefined) {
            await this.page.locator('input[ng-model="table.NumberSeat"]').fill(tableData.seats.toString());
        }

        if (tableData.description) {
            await this.page.locator('textarea[ng-model="table.Description"]').fill(tableData.description);
        }

        // Save table
        await this.elements.saveTableButton.click();

        // Wait for form to close
        await this.elements.tableWindow.waitFor({ state: 'hidden', timeout: 10000 });
    }

    private async createGroup(groupName: string): Promise<void> {
        // Click add group button
        await this.elements.addGroupButton.click();

        // Wait for group form to be visible
        await this.elements.groupNameInput.waitFor({ state: 'visible' });

        // Fill group name
        await this.elements.groupNameInput.fill(groupName);

        // Save group
        await this.elements.saveGroupButton.click();

        // Wait for group form to be processed
        await this.page.waitForTimeout(1000);
    }

    async updateTable(newTableName: string): Promise<void> {
        // Click update button for first table
        await this.page.locator('a:has-text("Cập nhật")').first().click();

        // Wait for form to be visible
        await this.elements.tableWindow.waitFor({ state: 'visible' });

        // Clear and fill new name
        await this.elements.tableNameInput.clear();
        await this.elements.tableNameInput.fill(newTableName);

        // Save changes
        await this.elements.saveTableButton.click();

        // Wait for form to close
        await this.elements.tableWindow.waitFor({ state: 'hidden', timeout: 10000 });
    }

    async deleteTable(): Promise<void> {
        // Click delete button for first table
        await this.page.locator('a[ng-click="deleteTable(dataItem)"]', { hasText: 'Xóa' }).first().click();

        // Confirm deletion
        await this.page.getByRole('button', { name: 'Đồng ý' }).click();

        // Wait for deletion to complete
        await this.page.waitForTimeout(2000);
    }

    async isTableVisible(tableName: string): Promise<boolean> {
        try {
            await this.page.getByRole('gridcell', { name: tableName }).waitFor({
                state: 'visible',
                timeout: 5000
            });
            return true;
        } catch {
            return false;
        }
    }

    async waitForTableToDisappear(tableName: string): Promise<void> {
        await this.page.getByRole('gridcell', { name: tableName }).waitFor({
            state: 'detached',
            timeout: 10000
        });
    }

    async getTableCount(): Promise<number> {
        const tableRows = this.page.locator('td.cell-name span.ng-binding');
        return await tableRows.count();
    }

    async getAllTableNames(): Promise<string[]> {
        const tableNames: string[] = [];
        const tableElements = this.page.locator('td.cell-name span.ng-binding');
        const count = await tableElements.count();

        for (let i = 0; i < count; i++) {
            const name = await tableElements.nth(i).textContent();
            if (name) {
                tableNames.push(name);
            }
        }

        return tableNames;
    }
}

interface ProductData {
    name: string;
    category: string;
    price: number;
    code?: string;
}

export class ProductPage {
    private readonly page: Page;
    private readonly addNewButton: Locator;
    private readonly addProductLink: Locator;
    private readonly productNameInput: Locator;
    private readonly basePriceInput: Locator;
    private readonly saveProductButton: Locator;
    private readonly confirmButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.addNewButton = page.locator('a:has-text("Thêm mới")').first();
        this.addProductLink = page.getByRole('link', { name: 'Thêm hàng hóa' });
        this.productNameInput = page.locator('input[ng-model="product.Name"]');
        this.basePriceInput = page.locator('input[ng-model="product.BasePrice"]');
        this.saveProductButton = page.locator('a[ng-enter="SaveProduct()"]');
        this.confirmButton = page.getByRole('button', { name: 'Đồng ý' });
    }

    async addProduct(productData: ProductData): Promise<void> {
        await this.addNewButton.click();
        await this.addProductLink.click();
        await this.productNameInput.fill(productData.name);

        await this.createCategory(productData.category);

        await this.basePriceInput.fill(productData.price.toString());
        await this.saveProductButton.click();
        await this.page.waitForTimeout(3000);
    }

    private async createCategory(categoryName: string): Promise<void> {
        await this.page.locator('a[ng-if="includeAdd"]').first().click();
        await this.page.locator('input[ng-model="category.Name"]').nth(1).fill(categoryName);

        const saveButtons = this.page.locator('a[ng-click="saveCategory()"]');
        for (let i = 0; i < await saveButtons.count(); i++) {
            const button = saveButtons.nth(i);
            if (await button.isVisible()) {
                await button.click();
                break;
            }
        }
        await this.page.waitForTimeout(1000);
    }

    async updateProduct(currentName: string, newName: string): Promise<void> {
        await this.page.locator('a.btn-mobile[ng-click="UpdateProduct(dataItem)"]:has-text("Cập nhật")').first().click();
        await this.productNameInput.fill(newName);
        await this.saveProductButton.click();
        await this.page.waitForTimeout(2000);
    }

    async deleteProduct(productName: string): Promise<void> {
        await this.page.locator('a.btn-danger[ng-click="DeleteProduct(dataItem)"]:has-text("Xóa")').first().click();
        await this.confirmButton.click();
        await this.page.waitForTimeout(2000);
    }

    async isProductVisible(productName: string): Promise<boolean> {
        try {
            await this.page.getByRole('gridcell', { name: productName }).waitFor({ timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    async waitForProductToDisappear(productName: string): Promise<void> {
        await this.page.getByRole('gridcell', { name: productName }).waitFor({
            state: 'detached',
            timeout: 10000
        });
    }
}