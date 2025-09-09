//import { test, expect } from '@playwright/test';
import { test, expect } from '../fixtures/auth.fixture';
import { LoginPage } from '../pages/LoginPage';
import { Menu, CashierPage } from '../pages/CashierPage';

// Thanh toán đơn hàng thành công
test('Thanh toán đơn hàng thành công', async ({ page, authPagePos }) => {
    // Mở tab Thực đơn
    const menu = new Menu(page);
    await menu.clickMenu("Thực đơn");

    // Tạo đơn hàng
    const cashierPage = new CashierPage(page);
    await cashierPage.createInvoice("Hàng hóa 1");

});