import { authTest as test, expect } from '../fixtures/auth.fixture';
import { CashierMenu, CashierPage } from '../pages/CashierPage';
import { InvoiceHelper } from "../helpers/invoiceHelper";

// Thanh toán đơn hàng thành công
test('Thanh toán đơn hàng thành công', async ({
    page,
    authPagePos,
    request,
    authToken
}) => {
    // Variables to track created data for cleanup
    let categoryId: number | null = null;
    let productId: number | null = null;
    let invoiceInfo: { invoiceId: number; invoiceCode: string } | null = null;

    try {
        // Step 1: Create test data first
        console.log(`🔨 Creating test data...`);

    // Create category with unique name to avoid conflicts
    const categoryName = `Test-Cat-${Date.now()}`;
    const categoryRes = await request.post(`${process.env.BASE_URL || 'https://fnb.kiotviet.vn'}/api/categories`, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Retailer': process.env.RETAILER || 'testfnbz27b',
            'Content-Type': 'application/json;charset=UTF-8',
            'branchid': '10351767',
            'x-branch-id': '10351767',
            'x-retailer-code': process.env.RETAILER || 'testfnbz27b',
            'x-retailer-id': '760874',
            'x-app-name': 'web-man',
        },
        data: {
            Category: {
                Id: 0,
                Name: categoryName,
                ParentId: 0
            },
            CompareCateName: ""
        }
    });

    const categoryData = await categoryRes.json();
    categoryId = categoryData.Data.Id;
    console.log(`✅ Category created: ${categoryData.Data.Name} (ID: ${categoryId})`);

    // Create product with unique code
    const productName = `Test Product`;
    const productCode = `TEST-PROD-${Date.now()}`;
    const productData = {
        Id: 0,
        ProductGroup: 1,
        ProductType: 2,
        CategoryId: categoryData.Data.Id,
        CategoryName: "",
        isActive: true,
        AllowsSale: true,
        isDeleted: false,
        Code: productCode,
        BasePrice: 10000,
        Cost: 1000,
        Name: productName,
        Unit: "",
        ListBranchHasPrivilege: [10351767],
        ProductFormulas: [],
        ListPriceBookDetail: [],
        ProductImages: []
    };

    const productRes = await request.post(`${process.env.BASE_URL || 'https://fnb.kiotviet.vn'}/api/products/addmany`, {
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Retailer': process.env.RETAILER || 'testfnbz27b',
            'branchid': '10351767',
            'x-branch-id': '10351767',
            'x-retailer-code': process.env.RETAILER || 'testfnbz27b',
            'x-retailer-id': '760874',
            'x-app-name': 'web-man',
        },
        multipart: {
            ListProducts: JSON.stringify([productData])
        }
    });

    const productResponse = await productRes.json();

    // Check if product creation was successful
    if (!productResponse.Data || !productResponse.Data[0]) {
        console.error('❌ Product creation failed. Response:', JSON.stringify(productResponse, null, 2));
        throw new Error('Failed to create product');
    }

    const product = productResponse.Data[0];
    productId = product.Id;
    console.log(`✅ Product created: ${product.Name} (ID: ${productId})`);

    // Step 3: Navigate to cashier page and wait for it to load
    console.log(`📱 Navigating to cashier page and waiting for load...`);
    console.log(`📱 Current URL after login: ${page.url()}`);

    await page.goto(`${process.env.BASE_URL || 'https://fnb.kiotviet.vn'}/${process.env.RETAILER || 'testfnbz27b'}/pos/#/cashier`, {
        waitUntil: 'domcontentloaded'
    });

    // Wait for the cashier page to be fully loaded
    await page.waitForLoadState('networkidle');
    console.log(`✅ Cashier page loaded at: ${page.url()}`);

    // Step 4: Now click on menu
    console.log(`📱 Now clicking on menu...`);
    const cashierMenu = new CashierMenu(page);
    await cashierMenu.clickMenu("Thực đơn");
    await page.waitForTimeout(5000);

    // Step 5: Wait for product to be visible in UI
    console.log(`🔍 Waiting for product to be visible in UI: ${product.Name}`);

    // Try to find the product with retries
    let productVisible = false;
    let retries = 0;
    const maxRetries = 12; // 12 retries = 60 seconds max

    while (!productVisible && retries < maxRetries) {
        try {
            await page.locator(`text=${product.Name}`).waitFor({ timeout: 5000 });
            productVisible = true;
            console.log(`✅ Product found in UI after ${retries * 5} seconds`);
        } catch (error) {
            retries++;
            console.log(`⏳ Product not visible yet, retry ${retries}/${maxRetries}...`);

            if (retries < maxRetries) {
                // Refresh the page to get latest data
                await page.reload();
                await page.waitForTimeout(5000);
            }
        }
    }

    if (!productVisible) {
        throw new Error(`Product "${product.Name}" not visible in UI after ${maxRetries * 5} seconds`);
    }

    // Step 6: Use the product
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

    invoiceInfo = await invoiceHelper.verifyInvoice(orderCode, product.Name, product.Id);
    console.log(`✅ Invoice verification successful`);

    console.log(`🎉 Test completed successfully with order: ${orderCode}`);

    } finally {
        // Cleanup: Delete created data (always runs, even if test fails)
        // Order: Invoice -> Product -> Category (due to foreign key dependencies)
        console.log(`🧹 Cleaning up test data...`);
        const invoiceHelper = new InvoiceHelper(request, authToken);

        // 1. Delete invoice first
        try {
            if (invoiceInfo) {
                await invoiceHelper.deleteInvoice(invoiceInfo.invoiceId, invoiceInfo.invoiceCode);
            }
        } catch (error) {
            console.warn(`⚠️ Failed to delete invoice:`, error);
        }

        // 2. Delete product (must be before category)
        try {
            if (productId) {
                await request.delete(`${process.env.BASE_URL || 'https://fnb.kiotviet.vn'}/api/products/${productId}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Retailer': process.env.RETAILER || 'testfnbz27b',
                        'branchid': '10351767',
                        'x-branch-id': '10351767',
                        'x-retailer-code': process.env.RETAILER || 'testfnbz27b',
                        'x-retailer-id': '760874',
                        'x-app-name': 'web-man',
                    }
                });
                console.log(`✅ Product deleted: ID=${productId}`);
            }
        } catch (error) {
            console.warn(`⚠️ Failed to delete product:`, error);
        }

        // 3. Delete category last
        try {
            if (categoryId) {
                await request.delete(`${process.env.BASE_URL || 'https://fnb.kiotviet.vn'}/api/categories?Id=${categoryId}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Retailer': process.env.RETAILER || 'testfnbz27b',
                        'branchid': '10351767',
                        'x-branch-id': '10351767',
                        'x-retailer-code': process.env.RETAILER || 'testfnbz27b',
                        'x-retailer-id': '760874',
                        'x-app-name': 'web-man',
                    }
                });
                console.log(`✅ Category deleted: ID=${categoryId}`);
            }
        } catch (error) {
            console.warn(`⚠️ Failed to delete category:`, error);
        }
    }
});


