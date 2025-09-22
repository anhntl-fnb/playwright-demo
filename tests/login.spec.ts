import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
//import { log } from 'console';

test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    // Clear any pre-filled data from previous sessions
    await loginPage.clearForm();
});

test('Login MHQL thành công', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginMan(
        process.env.RETAILER || "testfnbz27b",
        process.env.TEST_USERNAME || "anhntl",
        process.env.TEST_PASSWORD || "123"
    );
    await expect(page.getByText("Tổng quan")).toBeVisible();
});

test('Login MHBH thành công', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginPos(
        process.env.RETAILER || "testfnbz27b",
        process.env.TEST_USERNAME || "anhntl",
        process.env.TEST_PASSWORD || "123"
    );
    await expect(page.getByText("Phòng bàn")).toBeVisible();

});


test('Không nhập Tên đăng nhập', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginMan(
        process.env.RETAILER || "testfnbz27b",
        "",
        process.env.TEST_PASSWORD || "123"
    );
    await loginPage.expectErrorMessage("Bạn hãy nhập đầy đủ thông tin các trường");
});

test('Không nhập Mật khẩu', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginMan(
        process.env.RETAILER || "testfnbz27b",
        process.env.TEST_USERNAME || "anhntl",
        ""
    );
    await loginPage.expectErrorMessage("Bạn hãy nhập đầy đủ thông tin các trường");
});

test('Nhập sai tên đăng nhập/mật khẩu', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.loginMan(
        process.env.RETAILER || "testfnbz27b",
        "admin",
        "1234"
    );
    await loginPage.expectErrorMessage("Tên đăng nhập hoặc mật khẩu chưa đúng");
});