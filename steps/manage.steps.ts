import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { LoginPage } from '../pages/LoginPage';
import { ManagementMenu, TablePage, ProductPage } from '../pages/ManagePage';

Given('trước người dùng đã đăng nhập MHQL thành công', async function (this: CustomWorld) {
  if (!this.page) throw new Error('Page is not initialized');
  const loginPage = new LoginPage(this.page);
  await loginPage.goto();
  await loginPage.loginMan(
    process.env.RETAILER || 'testfnbz27b',
    process.env.TEST_USERNAME || 'anhntl',
    process.env.TEST_PASSWORD || '123'
  );
  await expect(this.page.getByText("Tổng quan")).toBeVisible();
});

When('người dùng vào tab {string}', async function (this: CustomWorld, tabName: string) {
  if (!this.page) throw new Error('Page is not initialized');
  await this.page.getByRole('link', { name: tabName }).click();
});

When('người dùng thêm mới bàn với thông tin:', async function (this: CustomWorld, dataTable) {
  if (!this.page) throw new Error('Page is not initialized');
  const tablePage = new TablePage(this.page);
  const data = dataTable.rowsHash();

  await tablePage.addTable({
    name: data['Tên bàn'],
    group: data['Nhóm'],
    position: parseInt(data['Vị trí']),
    seats: parseInt(data['Số ghế']),
    description: data['Ghi chú']
  });
});

When('người dùng cập nhật tên bàn thành {string}', async function (this: CustomWorld, newName: string) {
  if (!this.page) throw new Error('Page is not initialized');
  const tablePage = new TablePage(this.page);
  await tablePage.updateTable(newName);
});

When('người dùng xóa bàn {string}', async function (this: CustomWorld, tableName: string) {
  if (!this.page) throw new Error('Page is not initialized');
  const tablePage = new TablePage(this.page);
  await tablePage.deleteTable();
});

When('người dùng thêm mới hàng hóa {string} thuộc nhóm {string} với giá {string}',
  async function (this: CustomWorld, productName: string, categoryName: string, price: string) {
    if (!this.page) throw new Error('Page is not initialized');
    const productPage = new ProductPage(this.page);
    await productPage.addProduct({
      name: productName,
      category: categoryName,
      price: parseInt(price)
    });
  }
);

When('người dùng cập nhật hàng hóa {string} thành {string}',
  async function (this: CustomWorld, oldName: string, newName: string) {
    if (!this.page) throw new Error('Page is not initialized');
    const productPage = new ProductPage(this.page);
    await productPage.updateProduct(oldName, newName);
  }
);

When('người dùng xóa hàng hóa {string}', async function (this: CustomWorld, productName: string) {
  if (!this.page) throw new Error('Page is not initialized');
  const productPage = new ProductPage(this.page);
  await productPage.deleteProduct(productName);
});

Then('hệ thống hiển thị bàn {string} trong danh sách', async function (this: CustomWorld, tableName: string) {
  if (!this.page) throw new Error('Page is not initialized');
  await expect(this.page.getByRole('gridcell', { name: tableName })).toBeVisible();
});

Then('hệ thống không hiển thị bàn {string} trong danh sách', async function (this: CustomWorld, tableName: string) {
  if (!this.page) throw new Error('Page is not initialized');
  await expect(this.page.getByRole('gridcell', { name: tableName })).not.toBeVisible();
});

Then('hệ thống hiển thị hàng hóa {string} trong danh sách', async function (this: CustomWorld, productName: string) {
  if (!this.page) throw new Error('Page is not initialized');
  await expect(this.page.getByRole('gridcell', { name: productName })).toBeVisible();
});

Then('hệ thống không hiển thị hàng hóa {string} trong danh sách', async function (this: CustomWorld, productName: string) {
  if (!this.page) throw new Error('Page is not initialized');
  await expect(this.page.getByRole('gridcell', { name: productName })).not.toBeVisible();
});
