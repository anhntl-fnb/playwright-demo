import { Page, expect } from '@playwright/test';

export class LoginPage {
    constructor(public page: Page) { }

    async goto() {
        await this.page.goto("https://fnb.kiotviet.vn/");
    }

    async loginMan(shopName: string, username: string, password: string) {
        if (shopName) await this.page.getByRole("textbox", { name: "Tên gian hàng" }).fill(shopName);
        if (username) await this.page.getByRole("textbox", { name: "Tên đăng nhập" }).fill(username);
        if (password) await this.page.getByRole("textbox", { name: "Mật khẩu" }).fill(password);

        await this.page.getByRole("button", { name: "Quản lý" }).click();
    }

    async loginPos(shopName: string, username: string, password: string) {
        if (shopName) await this.page.getByRole("textbox", { name: "Tên gian hàng" }).fill(shopName);
        if (username) await this.page.getByRole("textbox", { name: "Tên đăng nhập" }).fill(username);
        if (password) await this.page.getByRole("textbox", { name: "Mật khẩu" }).fill(password);

        await this.page.locator('#loginNewSale').click();
    }

    async expectErrorMessage(message: string) {
        await expect(this.page.locator('.validation-summary-errors')).toContainText(message);
    }
}