import { Page, expect } from '@playwright/test';

export class CashierMenu {
    constructor(public page: Page) { }

    async clickMenu(menuItem: string) {
        await this.page.waitForTimeout(3000);
        await this.page.locator(`.text-menu:has-text("${menuItem}")`).click();
    }
}

export class CashierPage {
    constructor(public page: Page) { }

    async createInvoice(productName: string) {
        console.log(`🔍 Looking for product: ${productName}`);

        // Wait for products to load with simple timeout
        await this.page.waitForTimeout(5000);

        // Click on the product card (more specific selector)
        await this.page.locator('.product-name').filter({ hasText: productName }).first().click();
        console.log(`✅ Found and clicked product: ${productName}`);

        // Wait for order code to appear
        await this.page.waitForSelector('a[title^=" Mang về -"] > span', { timeout: 10000 });
        const orderCode = (await this.page.locator('a[title^=" Mang về -"] > span').textContent())!.trim();
        console.log("OrderCode: ", orderCode);

        // Complete payment
        await this.page.getByRole('button', { name: "Thanh toán (F9)" }).click();
        await this.page.waitForTimeout(1000);
        await this.page.getByRole('button', { name: 'Thanh toán' }).nth(1).click();

        return orderCode;
    }
}