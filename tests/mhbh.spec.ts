//import { test, expect } from '@playwright/test';
import { test, expect } from '../fixtures/auth.fixture';
import { LoginPage } from '../pages/LoginPage';
import { Menu, CashierPage } from '../pages/CashierPage';
import { InvoiceHelper } from "../helpers/invoiceHelper";

// Thanh toán đơn hàng thành công
test('Thanh toán đơn hàng thành công', async ({ page, authPagePos, request, authToken }) => {
    // Mở tab Thực đơn
    const menu = new Menu(page);
    await menu.clickMenu("Thực đơn");

    // Tạo hóa đơn
    const cashierPage = new CashierPage(page);
    const orderCode = await cashierPage.createInvoice("Hàng hóa 1");

    // Verify invoice qua API
    const invoiceHelper = new InvoiceHelper(request, authToken);
    await page.waitForTimeout(3000);
    await invoiceHelper.verifyInvoice(orderCode, authToken);

});
