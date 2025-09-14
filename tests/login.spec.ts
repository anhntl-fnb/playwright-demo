import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
//import { log } from 'console';

test('Login MHQL thành công', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginMan("testfnbz27b", "anhntl", "123");
    await expect(page.getByText("Tổng quan")).toBeVisible();
});

test('Login MHBH thành công', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginPos("testfnbz27b", "anhntl", "123");
    await expect(page.getByText("Phòng bàn")).toBeVisible();

});

test('Không nhập Tên gian hàng', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginMan("", "admin", "123");
    await loginPage.expectErrorMessage("Cửa hàng không tồn tại");
});

test('Không nhập Tên đăng nhập', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginMan("testfnbz27b", "", "123");
    await loginPage.expectErrorMessage("Bạn hãy nhập đầy đủ thông tin các trường");
});

test('Không nhập Mật khẩu', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginMan("testfnbz27b", "anhntl", "");
    await loginPage.expectErrorMessage("Bạn hãy nhập đầy đủ thông tin các trường");
});

test('Nhập sai tên đăng nhập/mật khẩu', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginMan("testfnbz27b", "admin", "1234");
    await loginPage.expectErrorMessage("Tên đăng nhập hoặc mật khẩu chưa đúng");
});