import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { expect, request as playwrightRequest } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { LoginPage } from '../pages/LoginPage';
import { CashierMenu, CashierPage } from '../pages/CashierPage';
import { InvoiceHelper } from '../helpers/invoiceHelper';

// Increase timeout for cashier tests
setDefaultTimeout(120000);

// Store test data in world context
interface CashierWorld extends CustomWorld {
  categoryId?: number;
  categoryName?: string;
  productId?: number;
  productName?: string;
  orderCode?: string;
}

Given('trước người dùng đã đăng nhập MHBH thành công', async function (this: CashierWorld) {
  if (!this.page) throw new Error('Page is not initialized');
  const loginPage = new LoginPage(this.page);
  await loginPage.goto();
  await loginPage.loginPos(
    process.env.RETAILER || 'testfnbz27b',
    process.env.TEST_USERNAME || 'anhntl',
    process.env.TEST_PASSWORD || '123'
  );
  await expect(this.page.getByText("Phòng bàn")).toBeVisible();
  await this.page.waitForTimeout(3000);
});

Given('hệ thống đã tạo dữ liệu test gồm danh mục và sản phẩm', async function (this: CashierWorld) {
  console.log('🔨 Creating test data...');

  // Get auth token first
  const requestContext = await playwrightRequest.newContext({
    baseURL: process.env.BASE_URL || 'https://fnb.kiotviet.vn',
    extraHTTPHeaders: {
      'Retailer': process.env.RETAILER || 'testfnbz27b'
    }
  });

  // Login to get token
  const loginResponse = await requestContext.post('/api/users/auth-login', {
    data: {
      username: process.env.TEST_USERNAME || 'anhntl',
      password: process.env.TEST_PASSWORD || '123',
      retailer: process.env.RETAILER || 'testfnbz27b'
    }
  });
  const loginData = await loginResponse.json();
  this.authToken = loginData.access_token;
  console.log(`✅ Auth token obtained: ${this.authToken ? 'exists' : 'missing'}`);

  // Create category
  this.categoryName = `Test-Cat-${Date.now()}`;
  const categoryRes = await requestContext.post('/api/categories', {
    headers: {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json;charset=UTF-8',
      'branchid': '10351767',
      'x-branch-id': '10351767',
      'x-retailer-code': process.env.RETAILER || 'testfnbz27b',
      'x-retailer-id': '760874',
      'x-app-name': 'web-man'
    },
    data: {
      Category: {
        Id: 0,
        Name: this.categoryName,
        ParentId: 0
      },
      CompareCateName: ""
    }
  });

  const categoryData = await categoryRes.json();
  this.categoryId = categoryData.Data.Id;
  console.log(`✅ Category created: ${categoryData.Data.Name} (ID: ${this.categoryId})`);

  // Create product
  const timestamp = Date.now();
  this.productName = 'Test Product';
  const productData = {
    Id: 0,
    ProductGroup: 1,
    ProductType: 2,
    CategoryId: this.categoryId,
    CategoryName: "",
    isActive: true,
    AllowsSale: true,
    isDeleted: false,
    Code: `TEST-PROD-${timestamp}`,
    BasePrice: 10000,
    Cost: 1000,
    Name: this.productName,
    Unit: "",
    ListBranchHasPrivilege: [10351767],
    ProductFormulas: [],
    ListPriceBookDetail: [],
    ProductImages: []
  };

  const productRes = await requestContext.post('/api/products/addmany', {
    headers: {
      'Authorization': `Bearer ${this.authToken}`,
      'branchid': '10351767',
      'x-branch-id': '10351767',
      'x-retailer-code': process.env.RETAILER || 'testfnbz27b',
      'x-retailer-id': '760874',
      'x-app-name': 'web-man'
    },
    multipart: {
      ListProducts: JSON.stringify([productData])
    }
  });

  const productResponse = await productRes.json();

  if (productResponse.Data && productResponse.Data.length > 0) {
    const product = productResponse.Data[0];
    this.productId = product.Id;
    console.log(`✅ Product created: ${product.Name} (ID: ${this.productId})`);
  } else {
    throw new Error(`Failed to create product: ${JSON.stringify(productResponse)}`);
  }

  await requestContext.dispose();
});

// Menu navigation is handled in common.steps.ts

When('người dùng chờ sản phẩm test hiển thị trên giao diện', async function (this: CashierWorld) {
  if (!this.page || !this.productName) throw new Error('Page or product name is not initialized');

  console.log(`🔍 Waiting for product to be visible: ${this.productName}`);

  let productVisible = false;
  let retries = 0;
  const maxRetries = 12;

  while (!productVisible && retries < maxRetries) {
    try {
      await this.page.locator(`text=${this.productName}`).waitFor({ timeout: 5000 });
      productVisible = true;
      console.log(`✅ Product found after ${retries * 5} seconds`);
    } catch (error) {
      retries++;
      console.log(`⏳ Retry ${retries}/${maxRetries}...`);
      if (retries < maxRetries) {
        await this.page.reload();
        await this.page.waitForTimeout(5000);
      }
    }
  }

  if (!productVisible) {
    throw new Error(`Product "${this.productName}" not visible after ${maxRetries * 5} seconds`);
  }
});

When('người dùng tạo hóa đơn với sản phẩm test', async function (this: CashierWorld) {
  if (!this.page || !this.productName) throw new Error('Page or product name is not initialized');

  const cashierPage = new CashierPage(this.page);
  this.orderCode = await cashierPage.createInvoice(this.productName);
  console.log(`✅ Invoice created: ${this.orderCode}`);
});

Then('hệ thống tạo hóa đơn thành công', async function (this: CashierWorld) {
  expect(this.orderCode).toBeDefined();
  expect(this.orderCode).not.toBe('');
});

Then('hóa đơn được xác thực qua API', async function (this: CashierWorld) {
  if (!this.orderCode || !this.authToken || !this.productName || !this.productId) {
    console.log(`❌ Missing data - orderCode: ${this.orderCode}, authToken: ${this.authToken ? 'exists' : 'missing'}, productName: ${this.productName}, productId: ${this.productId}`);
    throw new Error('Missing required data for verification');
  }

  console.log('🔍 Verifying invoice via API...');

  const requestContext = await playwrightRequest.newContext({
    baseURL: process.env.BASE_URL || 'https://fnb.kiotviet.vn',
    extraHTTPHeaders: {
      'Retailer': process.env.RETAILER || 'testfnbz27b'
    }
  });

  const invoiceHelper = new InvoiceHelper(requestContext, this.authToken);
  await this.page!.waitForTimeout(3000);

  await invoiceHelper.verifyInvoice(this.orderCode, this.productName, this.productId);
  console.log('✅ Invoice verification successful');

  await requestContext.dispose();
});

Then('dữ liệu test được xóa sau khi hoàn thành', async function (this: CashierWorld) {
  console.log('🧹 Cleaning up test data...');

  const requestContext = await playwrightRequest.newContext({
    baseURL: process.env.BASE_URL || 'https://fnb.kiotviet.vn',
    extraHTTPHeaders: {
      'Retailer': process.env.RETAILER || 'testfnbz27b'
    }
  });

  const headers = {
    'Authorization': `Bearer ${this.authToken}`,
    'branchid': '10351767',
    'x-branch-id': '10351767',
    'x-retailer-code': process.env.RETAILER || 'testfnbz27b',
    'x-retailer-id': '760874',
    'x-app-name': 'web-man'
  };

  try {
    // Delete product
    if (this.productId) {
      await requestContext.delete(`/api/products/${this.productId}`, { headers });
      console.log(`✅ Product deleted: ID=${this.productId}`);
    }

    // Delete category
    if (this.categoryId) {
      await requestContext.delete(`/api/categories?Id=${this.categoryId}`, { headers });
      console.log(`✅ Category deleted: ID=${this.categoryId}`);
    }
  } catch (error) {
    console.warn('⚠️ Cleanup warning:', error);
  }

  await requestContext.dispose();
});
