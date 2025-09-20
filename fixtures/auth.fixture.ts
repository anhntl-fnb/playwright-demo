import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

// Khai báo type cho fixture mới
type AuthFixtures = {
  authPageMan: LoginPage;
  authPagePos: LoginPage;
  authToken: string;
};

// Extend test mặc định của Playwright
export const authTest = base.extend<AuthFixtures>({

  // Login MHQL
  authPageMan: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginMan(
      process.env.RETAILER || "testfnbz27b",
      process.env.TEST_USERNAME || "anhntl",
      process.env.TEST_PASSWORD || "123"
    );

    // Cho test case sử dụng
    await use(loginPage);
  },

  // Login MHBH
  authPagePos: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginPos(
      process.env.RETAILER || "testfnbz27b",
      process.env.TEST_USERNAME || "anhntl",
      process.env.TEST_PASSWORD || "123"
    );

    // Cho test case sử dụng
    await use(loginPage);
  },


  // Cách 1: Lấy token từ localStorage
  // authToken: async ({ page }, use) => {
  //   const loginPage = new LoginPage(page);
  //   await loginPage.goto();
  //   const response = await loginPage.loginPos(
  //     process.env.RETAILER || "testfnbz27b",
  //     process.env.TEST_USERNAME || "anhntl",
  //     process.env.TEST_PASSWORD || "123"
  //   );

  //   await page.waitForLoadState('networkidle');
  //   const raw = await page.evaluate(() => localStorage.getItem("kvSession"));
  //   const session = raw ? JSON.parse(raw) : null;
  //   const token = session?.BearerToken;
  //   await use(token as string);

  // },

  // Lấy Bearer Token = cách gọi API login trực tiếp
  authToken: async ({ request }, use) => {
    const response = await request.post(
      `${process.env.BASE_URL || "https://fnb.kiotviet.vn"}/api/users/auth-login?format=json`,
      {
        data: {
          UserName: process.env.TEST_USERNAME || "anhntl",
          Password: process.env.TEST_PASSWORD || "123",
        },
        headers: {
          Retailer: process.env.RETAILER || "testfnbz27b",
        },
      }
    );

    const body = await response.json();
    const token = body?.BearerToken;
    // Expose cho test case dùng
    await use(token);
  },

});

export { expect } from '@playwright/test';