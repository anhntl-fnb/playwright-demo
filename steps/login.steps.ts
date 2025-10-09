import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { LoginPage } from '../pages/LoginPage';

Given('người dùng đang ở trang đăng nhập', async function (this: CustomWorld) {
  if (!this.page) throw new Error('Page is not initialized');
  const loginPage = new LoginPage(this.page);
  await loginPage.goto();
});

When('người dùng đăng nhập MHQL với thông tin hợp lệ', async function (this: CustomWorld) {
  if (!this.page) throw new Error('Page is not initialized');
  const loginPage = new LoginPage(this.page);
  await loginPage.loginMan(
    process.env.RETAILER || 'testfnbz27b',
    process.env.TEST_USERNAME || 'anhntl',
    process.env.TEST_PASSWORD || '123'
  );
});

When('người dùng đăng nhập MHBH với thông tin hợp lệ', async function (this: CustomWorld) {
  if (!this.page) throw new Error('Page is not initialized');
  const loginPage = new LoginPage(this.page);
  await loginPage.loginPos(
    process.env.RETAILER || 'testfnbz27b',
    process.env.TEST_USERNAME || 'anhntl',
    process.env.TEST_PASSWORD || '123'
  );
});

When('người dùng đăng nhập với tên cửa hàng {string} và mật khẩu {string} nhưng bỏ trống tên đăng nhập',
  async function (this: CustomWorld, retailer: string, password: string) {
    if (!this.page) throw new Error('Page is not initialized');
    const loginPage = new LoginPage(this.page);
    await loginPage.loginMan(retailer, '', password);
  }
);

When('người dùng đăng nhập với tên cửa hàng {string} và tên đăng nhập {string} nhưng bỏ trống mật khẩu',
  async function (this: CustomWorld, retailer: string, username: string) {
    if (!this.page) throw new Error('Page is not initialized');
    const loginPage = new LoginPage(this.page);
    await loginPage.loginMan(retailer, username, '');
  }
);

When('người dùng đăng nhập với tên cửa hàng {string} và tên đăng nhập {string} và mật khẩu {string}',
  async function (this: CustomWorld, retailer: string, username: string, password: string) {
    if (!this.page) throw new Error('Page is not initialized');
    const loginPage = new LoginPage(this.page);
    await loginPage.loginMan(retailer, username, password);
  }
);

Then('hệ thống hiển thị trang {string}', async function (this: CustomWorld, pageName: string) {
  if (!this.page) throw new Error('Page is not initialized');
  await expect(this.page.getByText(pageName)).toBeVisible();
});

Then('hệ thống hiển thị lỗi {string}', async function (this: CustomWorld, errorMessage: string) {
  if (!this.page) throw new Error('Page is not initialized');
  const loginPage = new LoginPage(this.page);
  await loginPage.expectErrorMessage(errorMessage);
});
