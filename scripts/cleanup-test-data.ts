import { request as playwrightRequest } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function cleanupTestData() {
  console.log('🧹 Starting cleanup of test data...\n');

  const requestContext = await playwrightRequest.newContext({
    baseURL: process.env.BASE_URL || 'https://fnb.kiotviet.vn',
    extraHTTPHeaders: {
      'Retailer': process.env.RETAILER || 'testfnbz27b'
    }
  });

  // Login to get auth token
  console.log('🔐 Logging in...');
  const loginResponse = await requestContext.post('/api/users/auth-login', {
    data: {
      username: process.env.TEST_USERNAME || 'anhntl',
      password: process.env.TEST_PASSWORD || '123',
      retailer: process.env.RETAILER || 'testfnbz27b'
    }
  });
  const loginData = await loginResponse.json();
  const authToken = loginData.access_token;
  console.log('✅ Logged in successfully\n');

  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'branchid': '10351767',
    'x-branch-id': '10351767',
    'x-retailer-code': process.env.RETAILER || 'testfnbz27b',
    'x-retailer-id': '760874',
    'x-app-name': 'web-man'
  };

  // Get all products
  console.log('📦 Fetching all products...');
  const productsResponse = await requestContext.get('/api/products', { headers });
  const productsData = await productsResponse.json();

  if (productsData.Data && Array.isArray(productsData.Data)) {
    const testProducts = productsData.Data.filter((p: any) =>
      p.Name?.includes('Test') ||
      p.Code?.startsWith('TEST-PROD') ||
      p.Code === 'TEST-PRODUCT'
    );

    console.log(`Found ${testProducts.length} test products to delete\n`);

    for (const product of testProducts) {
      try {
        await requestContext.delete(`/api/products/${product.Id}`, { headers });
        console.log(`✅ Deleted product: ${product.Name} (ID: ${product.Id}, Code: ${product.Code})`);
      } catch (error) {
        console.warn(`⚠️  Failed to delete product ${product.Id}:`, error);
      }
    }
  }

  // Get all categories
  console.log('\n📁 Fetching all categories...');
  const categoriesResponse = await requestContext.get('/api/categories', { headers });
  const categoriesData = await categoriesResponse.json();

  if (categoriesData.Data && Array.isArray(categoriesData.Data)) {
    const testCategories = categoriesData.Data.filter((c: any) =>
      c.Name?.includes('Test-Cat') ||
      c.Name?.includes('Test')
    );

    console.log(`Found ${testCategories.length} test categories to delete\n`);

    for (const category of testCategories) {
      try {
        await requestContext.delete(`/api/categories?Id=${category.Id}`, { headers });
        console.log(`✅ Deleted category: ${category.Name} (ID: ${category.Id})`);
      } catch (error) {
        console.warn(`⚠️  Failed to delete category ${category.Id}:`, error);
      }
    }
  }

  await requestContext.dispose();
  console.log('\n✨ Cleanup completed!');
}

cleanupTestData().catch(console.error);
