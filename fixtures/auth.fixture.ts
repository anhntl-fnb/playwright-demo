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
    await loginPage.loginMan("testfnbz27b", "anhntl", "123");

    // Cho test case sử dụng
    await use(loginPage);
  },

  // Login MHBH
  authPagePos: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginPos("testfnbz27b", "anhntl", "123");

    // Cho test case sử dụng
    await use(loginPage);
  },


  // Cách 1: Lấy token từ localStorage
  // authToken: async ({ page }, use) => {
  //   const loginPage = new LoginPage(page);
  //   await loginPage.goto();
  //   const response = await loginPage.loginPos("testfnbz27b", "anhntl", "123");

  //   await page.waitForLoadState('networkidle');
  //   const raw = await page.evaluate(() => localStorage.getItem("kvSession"));
  //   const session = raw ? JSON.parse(raw) : null;
  //   const token = session?.BearerToken;
  //   await use(token as string);

  // },

  // Lấy Bearer Token = cách gọi API login trực tiếp
  authToken: async ({ request }, use) => {
    const response = await request.post("https://fnb.kiotviet.vn/api/users/auth-login?format=json",
      {
        data: {
          UserName: "anhntl",
          Password: "123",
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