import { When } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { ManagementMenu } from '../pages/ManagePage';
import { CashierMenu } from '../pages/CashierPage';

// Shared step for navigating to menu (both management and cashier)
When('người dùng vào menu {string}', async function (this: CustomWorld, menuName: string) {
  if (!this.page) throw new Error('Page is not initialized');

  // Try management menu first
  try {
    const managementMenu = new ManagementMenu(this.page);
    await managementMenu.clickMenu(menuName);
  } catch (e) {
    // If management menu fails, try cashier menu
    const cashierMenu = new CashierMenu(this.page);
    await cashierMenu.clickMenu(menuName);
    await this.page.waitForTimeout(5000);
  }
});
