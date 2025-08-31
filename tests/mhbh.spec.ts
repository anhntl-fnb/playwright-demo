import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test("Login thành công trang Bán hàng", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginPos("testfnbz27b", "admin", "4321");
    await expect(page).toHaveTitle(/Thu ngân/);
})