import { dataTest as test, expect } from '../fixtures/data.fixture';
import { CashierMenu, CashierPage } from '../pages/CashierPage';
import { InvoiceHelper } from "../helpers/invoiceHelper";

// Thanh toán đơn hàng thành công
test('Thanh toán đơn hàng thành công', async ({
    page,
    authPagePos,
    request,
    authToken,
    category,
    product
}) => {
    console.log(`🔨 Using Category: ${category.Name} (ID: ${category.Id})`);
    console.log(`🔨 Using Product: ${product.Name} (ID: ${product.Id})`);

    // Wait for page to be fully loaded after login
    await page.waitForTimeout(3000);

    // Mở tab Thực đơn
    console.log(`📱 Navigating to menu...`);
    const cashierMenu = new CashierMenu(page);
    await cashierMenu.clickMenu("Thực đơn");

    // Wait for menu page to load
    await page.waitForTimeout(5000);
    console.log(`📋 Menu page loaded, looking for product...`);

    // Tạo hóa đơn với product từ fixture
    const cashierPage = new CashierPage(page);
    let orderCode: string;

    try {
        orderCode = await cashierPage.createInvoice(product.Name);
        console.log(`✅ Invoice created successfully: ${orderCode}`);
    } catch (error) {
        console.error(`❌ Failed to create invoice with product ${product.Name}:`, error);

        // Take screenshot for debugging
        await page.screenshot({ path: `error-${Date.now()}.png`, fullPage: true });

        // Log current page content for debugging
        const pageContent = await page.content();
        console.log(`📄 Current page URL: ${page.url()}`);
        console.log(`🔍 Looking for products on page...`);

        throw error;
    }

    // Verify invoice qua API
    console.log(`🔍 Verifying invoice via API...`);
    const invoiceHelper = new InvoiceHelper(request, authToken);
    await page.waitForTimeout(3000);

    try {
        await invoiceHelper.verifyInvoice(orderCode);
        console.log(`✅ Invoice verification successful`);
    } catch (error) {
        console.error(`❌ Invoice verification failed:`, error);
        throw error;
    }

    console.log(`🎉 Test completed successfully with order: ${orderCode}`);
});


