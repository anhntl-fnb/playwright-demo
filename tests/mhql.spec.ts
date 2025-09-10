//import { test, expect } from '@playwright/test';
import { test, expect } from '../fixtures/auth.fixture';
import { LoginPage } from '../pages/LoginPage';
import { Menu, TablePage, ProductPage } from '../pages/ManagePage';


// CRUD Phòng bàn
test('Thêm mới phòng bàn thành công', async ({ page, authPageMan }) => {
    const menu = new Menu(page);
    const tablePage = new TablePage(page);

    await menu.clickMenu("Phòng/Bàn");
    await tablePage.addTable("Bàn 1", "Nhóm 1");
    await expect(page.getByRole('gridcell', { name: 'Bàn 1' })).toBeVisible();
});

test('Cập nhật phòng bàn thành công', async ({ page, authPageMan }) => {
    const menu = new Menu(page);
    const tablePage = new TablePage(page);

    await menu.clickMenu("Phòng/Bàn");
    await tablePage.updateTable("Bàn 1 update");
    await expect(page.getByRole('gridcell', { name: 'Bàn 1 update' })).toBeVisible();

});

test('Xóa phòng bàn', async ({ page, authPageMan }) => {
    const menu = new Menu(page);
    const tablePage = new TablePage(page);

    await menu.clickMenu("Phòng/Bàn");
    await tablePage.deleteTable();
    await expect(page.getByRole('gridcell', { name: 'Bàn 1 update' })).not.toBeVisible();
});


// CRUD Hàng hóa
test.only('Thêm mới hàng hóa thành công', async ({ page, authPageMan }) => {
    const menu = new Menu(page);
    const productPage = new ProductPage(page);

    await menu.clickMenu("Hàng hóa");
    await page.getByRole('link', { name: 'Danh mục' }).click();
    await productPage.addProduct("Hàng hóa 1", "Nhóm hàng 1", 10000);
    await expect(page.getByRole('gridcell', { name: 'Hàng hóa 1' })).toBeVisible();
});

test.only('Cập nhật hàng hóa thành công', async ({ page, authPageMan }) => {
    const menu = new Menu(page);
    const productPage = new ProductPage(page);

    await menu.clickMenu("Hàng hóa");
    await page.getByRole('link', { name: 'Danh mục' }).click();
    await productPage.updateProduct("Hàng hóa 1", "Hàng hóa 1 update");
    await expect(page.getByRole('gridcell', { name: 'Hàng hóa 1 update' })).toBeVisible();
});

test.only('Xóa hàng hóa thành công', async ({ page, authPageMan }) => {
    const menu = new Menu(page);
    const productPage = new ProductPage(page);

    await menu.clickMenu("Hàng hóa");
    await page.getByRole('link', { name: 'Danh mục' }).click();
    await productPage.deleteProduct("Hàng hóa 1 update");
    await expect(page.getByRole('gridcell', { name: 'Hàng hóa 1 upate' })).not.toBeVisible();
});

