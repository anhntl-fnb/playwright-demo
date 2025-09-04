import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { Menu, TablePage, ProductPage } from '../pages/ManagePage';


test("Thêm/sửa/xóa phòng bàn thành công", async ({ page }) => {
    // Login thành công MHQL
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginMan("testfnbz27b", "admin", "4321");

    // Mở menu Phòng bàn
    const menu = new Menu(page);
    await menu.clickMenu("Phòng/Bàn");

    // Thêm mới Phòng bàn
    const tablePage = new TablePage(page);
    await tablePage.addTable("Bàn 1", "Nhóm 1");

    // Cập nhật Phòng bàn
    await tablePage.updateTable("Bàn 1 update");

    // Xóa Phòng bàn
    await tablePage.deleteTable();

});


test('Thêm/sửa/xóa hàng hóa thành công', async ({ page }) => {
    // Login thành công MHQL
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginMan("testfnbz27b", "admin", "4321");

    // Mở menu Phòng bàn > Danh mục
    const menu = new Menu(page);
    await menu.clickMenu("Hàng hóa");
    await page.getByRole('link', { name: 'Danh mục' }).click();

    // Thêm mới Hàng hóa
    const productPage = new ProductPage(page);
    await productPage.addProduct("Hàng hóa 1", "Nhóm hàng 1", 10000);
})