import { Before, After } from '@cucumber/cucumber';
import { CustomWorldImpl } from './world';
import { request as playwrightRequest } from '@playwright/test';

// Extend CustomWorldImpl with cashier test data properties
interface CashierWorld extends CustomWorldImpl {
  categoryId?: number;
  productId?: number;
  authToken?: string;
}

Before(async function (this: CustomWorldImpl) {
  await this.init();
});

After(async function (this: CashierWorld) {
  // Cleanup test data if exists (for cashier tests)
  if (this.productId || this.categoryId) {
    console.log('🧹 Cleaning up test data in After hook...');

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
      if (this.productId) {
        await requestContext.delete(`/api/products/${this.productId}`, { headers });
        console.log(`✅ Product deleted: ID=${this.productId}`);
      }

      if (this.categoryId) {
        await requestContext.delete(`/api/categories?Id=${this.categoryId}`, { headers });
        console.log(`✅ Category deleted: ID=${this.categoryId}`);
      }
    } catch (error) {
      console.warn('⚠️ Cleanup warning:', error);
    }

    await requestContext.dispose();
  }

  // Cleanup browser
  await this.cleanup();
});
