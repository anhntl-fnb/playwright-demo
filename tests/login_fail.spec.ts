import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { log } from 'console';

//TC1: Validation - Không nhập tên gian hàng
// test('Không nhập Tên gian hàng', async ({ page }) => {

//     // Step 1: Goto Login page
//     await page.goto("https://fnb.kiotviet.vn/");

//     // Step 2: Nhập Tên đăng nhập
//     await page.getByRole("textbox", { name: "Tên đăng nhập" }).fill("admin");

//     // Step 3: Nhập mật khẩu
//     await page.getByRole("textbox", { name: "Mật khẩu" }).fill("4321");

//     // Step 4: Click vào button Quản lý
//     await page.getByRole("button", { name: "Quản lý" }).click();

//     // Step 5: Verify error msg
//     await expect(page.locator('.validation-summary-errors')).toContainText("Cửa hàng không tồn tại");

// });

// //TC2: Validation - Không nhập tên đăng nhập
// test('Không nhập Tên đăng nhập', async ({ page }) => {
//     // Step 1: Goto Login page
//     await page.goto("https://fnb.kiotviet.vn/");

//     // Step 2: Nhập Tên gian hàng
//     await page.getByRole("textbox", { name: "Tên gian hàng" }).fill("testfnbz27b");

//     // Step 3: Nhập mật khẩu
//     await page.getByRole("textbox", { name: "Mật khẩu" }).fill("4321");

//     // Step 4: Click vào button Quản lý
//     await page.getByRole("button", { name: "Quản lý" }).click();

//     // Step 5: Verify error msg
//     await expect(page.locator('.validation-summary-errors')).toContainText("Bạn hãy nhập đầy đủ thông tin các trường");

// })

test('Không nhập Tên gian hàng', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("", "admin", "4321");
    await loginPage.expectErrorMessage("Cửa hàng không tồn tại");
});

test('Không nhập Tên đăng nhập', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("testfnbz27b", "", "4321");
    await loginPage.expectErrorMessage("Bạn hãy nhập đầy đủ thông tin các trường");
});

test('Không nhập Mật khẩu', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("testfnbz27b", "admin", "");
    await loginPage.expectErrorMessage("Bạn hãy nhập đầy đủ thông tin các trường");
});

test('Nhập sai tên đăng nhập/mật khẩu', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("testfnbz27b", "admin", "123");
    await loginPage.expectErrorMessage("Tên đăng nhập hoặc mật khẩu chưa đúng");
});