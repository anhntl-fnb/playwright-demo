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
    // Step 1: Navigate to cashier page (don't wait for full load)
    console.log(`📱 Navigating to cashier page...`);
    await page.waitForTimeout(3000);

    // Step 2: Create test data immediately (don't wait for page load)
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
    console.log(`✅ Category created: ${categoryData.Data.Name} (ID: ${categoryData.Data.Id})`);

    // Create product
    const productName = `Test Product`;
    const productData = {
        Id: 0,
        ProductGroup: 1,
        ProductType: 2,
        CategoryId: categoryData.Data.Id,
        CategoryName: "",
        isActive: true,
        AllowsSale: true,
        isDeleted: false,
        Code: `TEST-PRODUCT`,
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
    const product = productResponse.Data[0];
    console.log(`✅ Product created: ${product.Name} (ID: ${product.Id})`);

    // Step 3: Now navigate to menu (data will sync while we navigate)
    console.log(`📱 Now clicking on menu...`);
    const cashierMenu = new CashierMenu(page);
    await cashierMenu.clickMenu("Thực đơn");
    await page.waitForTimeout(5000);

    // Step 4: Wait for product to be visible in UI
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

    // Step 5: Use the product
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
        await invoiceHelper.verifyInvoice(orderCode, product.Name, product.Id);
        console.log(`✅ Invoice verification successful`);
    } catch (error) {
        console.error(`❌ Invoice verification failed:`, error);
        throw error;
    }

    console.log(`🎉 Test completed successfully with order: ${orderCode}`);

    // Cleanup: Delete created data
    console.log(`🧹 Cleaning up test data...`);
    try {
        // Delete product
        await request.delete(`${process.env.BASE_URL || 'https://fnb.kiotviet.vn'}/api/products/${product.Id}`, {
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
        console.log(`✅ Product deleted: ID=${product.Id}`);

        // Delete category
        await request.delete(`${process.env.BASE_URL || 'https://fnb.kiotviet.vn'}/api/categories?Id=${categoryData.Data.Id}`, {
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
        console.log(`✅ Category deleted: ID=${categoryData.Data.Id}`);
    } catch (error) {
        console.warn(`⚠️ Cleanup warning:`, error);
    }
});


