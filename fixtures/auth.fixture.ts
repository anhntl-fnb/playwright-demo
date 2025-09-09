import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

// Khai báo type cho fixture mới
type AuthFixtures = {
  authPageMan: LoginPage;
  authPagePos: LoginPage;
};

// Extend test mặc định của Playwright
export const test = base.extend<AuthFixtures>({
  authPageMan: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    // Login 1 lần
    await loginPage.goto();
    await loginPage.loginMan("testfnbz27b", "anhntl", "123");

    // Cho test case sử dụng
    await use(loginPage);
  },


  authPagePos: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    // Login 1 lần
    await loginPage.goto();
    await loginPage.loginPos("testfnbz27b", "anhntl", "123");

    // Cho test case sử dụng
    await use(loginPage);
  },

});



export { expect } from '@playwright/test';