import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export interface CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  authToken?: string;
  categoryId?: number;
  categoryName?: string;
  productId?: number;
  productName?: string;
  orderCode?: string;
}

export class CustomWorldImpl extends World implements CustomWorld {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  authToken?: string;
  categoryId?: number;
  categoryName?: string;
  productId?: number;
  productName?: string;
  orderCode?: string;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init() {
    this.browser = await chromium.launch({
      headless: process.env.HEADLESS === 'true'
    });
    this.context = await this.browser.newContext({
      baseURL: process.env.BASE_URL || 'https://fnb.kiotviet.vn',
      extraHTTPHeaders: {
        'Retailer': process.env.RETAILER || 'testfnbz27b'
      }
    });
    this.page = await this.context.newPage();
  }

  async cleanup() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }
}

setWorldConstructor(CustomWorldImpl);
