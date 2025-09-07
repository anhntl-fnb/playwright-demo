import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { Menu, CashierPage } from '../pages/CashierPage';


test("Login thành công trang Bán hàng", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginPos("testfnbz27b", "admin", "4321");
    await expect(page).toHaveTitle(/Thu ngân/);
})

test('Tạo đơn hàng', async ({ page }) => {
    // Login MHBH thành công
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginPos("testfnbz27b", "admin", "4321");
    //await expect(page).toHaveTitle(/Thu ngân/);

    // Mở tab Thực đơn
    const menu = new Menu(page);
    await menu.clickMenu("Thực đơn");

    // Tạo đơn hàng
    const cashierPage = new CashierPage(page);
    await cashierPage.createOrder("Hàng hóa 1");

})