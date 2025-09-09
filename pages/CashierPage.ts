import { Page, expect } from '@playwright/test';

export class Menu {
    constructor(public page: Page) { }

    async clickMenu(menuItem: string) {
        await this.page.waitForTimeout(3000);
        await this.page.locator(`.text-menu:has-text("${menuItem}")`).click();
    }
}

export class CashierPage {
    constructor(public page: Page) { }

    async createInvoice(productName: string) {
        await this.page.locator(`.product-name:has-text("${productName}")`).click();
        await this.page.getByRole('button', { name: "Thanh toán (F9)" }).click();
        await this.page.waitForTimeout(1000);
        await this.page.getByRole('button', { name: 'Thanh toán' }).nth(1).click();
    }
}