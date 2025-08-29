import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

// TC1: Login thành công
// test('Login page FnB thành công', async ({ page }) => {
//     // Step 1: Goto Login page
//     await page.goto("https://fnb.kiotviet.vn/");

//     // Step 2: Verify title chứa "Đăng nhập"
//     //await expect(page).toHaveTitle(/Đăng nhập/);

//     // Step 3: Nhập Tên gian hàng
//     await page.getByRole('textbox', { name: "Tên gian hàng" }).fill("testfnbz27b");

//     // Step 4: Nhập Tên đăng nhập
//     await page.getByRole('textbox', { name: "Tên đăng nhập" }).fill("admin");

//     // Step 5: Nhập Mật khẩu
//     await page.getByRole('textbox', { name: "Mật khẩu" }).fill("4321");

//     // Step 6: Click vào button Quản lý
//     await page.getByRole('button', { name: "Quản lý" }).click();

//     //Step 7: Verify login thành công
//     await expect(page).toHaveTitle(/Tổng quan/);
// });

test("Login thành công", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("testfnbz27b", "admin", "4321");
    await expect(page).toHaveTitle(/Tổng quan/);
})

