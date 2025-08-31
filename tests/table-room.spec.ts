import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { Menu, TablePage } from '../pages/ManagePage';

test("Thêm mới phòng bàn thành công", async ({ page }) => {

    // Login thành công MHQL
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginMan("testfnbz27b", "admin", "4321");
    //await expect(page).toHaveTitle(/Tổng quan/);

    // Mở menu Phòng bàn và tạo mới item
    const menu = new Menu(page);
    const tablePage = new TablePage(page);

    await menu.clickMenu("Phòng/Bàn");
    await tablePage.addTable("Bàn 1", "Nhóm 1");
});



