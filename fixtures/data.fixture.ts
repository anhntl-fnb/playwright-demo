import { authTest } from './auth.fixture';
import { APIRequestContext } from '@playwright/test';

// Khai báo types
interface ApiResponse<T> {
    Message: string;
    Data: T;
    ResponseStatus?: {
        ErrorCode?: string;
        Message?: string;
        Errors?: string[];
    };
}

interface CategoryData {
    Id: number;
    Name: string;
    RetailerId: number;
    IsActive: boolean;
    isDeleted: boolean;
    Rank: number;
    Children: any[];
    Products: any[];
    HasChild: boolean;
}

type CategoryResponse = ApiResponse<CategoryData>;

interface ProductData {
    Id: number;
    Name: string;
    CategoryId: number;
    BasePrice: number;
    Code: string;
    Unit: string;
    ProductGroup: number;
    ProductType: number;
    isActive: boolean;
    AllowsSale: boolean;
    isDeleted: boolean;
}

type ProductResponse = ApiResponse<ProductData[]>; // Array vì addmany endpoint

type TestData = {
    category: CategoryData;
    product: ProductData;
    invoices: number[]; // lưu lại danh sách invoice Id để xoá sau
};

// Helper functions
const createHeaders = (authToken: string) => ({
    'Authorization': `Bearer ${authToken}`,
    'Retailer': process.env.RETAILER || 'testfnbz27b',
    'Content-Type': 'application/json;charset=UTF-8',
    'branchid': '10351767', // Add from curl
    'x-branch-id': '10351767',
    'x-retailer-code': process.env.RETAILER || 'testfnbz27b',
    'x-retailer-id': '760874', // From curl - may need to be dynamic
    'x-app-name': 'web-man',
    'accept': 'application/json, text/plain, */*'
});

const getBaseUrl = () => process.env.BASE_URL || 'https://fnb.kiotviet.vn';

const validateApiResponse = (response: any, entityType: string): void => {
    if (response.ResponseStatus?.ErrorCode) {
        throw new Error(`${entityType} creation failed: ${response.ResponseStatus.Message}`);
    }

    // Handle both single object and array responses
    const data = Array.isArray(response.Data) ? response.Data[0] : response.Data;
    if (!data?.Id) {
        throw new Error(`${entityType} creation failed: No ID returned in Data`);
    }
};

const safeCleanupCategory = async (
    request: APIRequestContext,
    authToken: string,
    categoryId: number
): Promise<void> => {
    try {
        // Category delete uses query parameter format
        const deleteRes = await request.delete(`${getBaseUrl()}/api/categories?Id=${categoryId}`, {
            headers: createHeaders(authToken),
        });

        if (deleteRes.ok()) {
            console.log(`✅ Category deleted: ID=${categoryId}`);
        } else {
            console.warn(`⚠️ Failed to delete Category: ${deleteRes.status()} - ${await deleteRes.text()}`);
        }
    } catch (error) {
        console.error(`❌ Cleanup error for Category ${categoryId}:`, error);
    }
};

const safeCleanupProduct = async (
    request: APIRequestContext,
    authToken: string,
    productId: number
): Promise<void> => {
    try {
        // Product delete uses path parameter format
        const deleteRes = await request.delete(`${getBaseUrl()}/api/products/${productId}`, {
            headers: createHeaders(authToken),
        });

        if (deleteRes.ok()) {
            console.log(`✅ Product deleted: ID=${productId}`);
        } else {
            console.warn(`⚠️ Failed to delete Product: ${deleteRes.status()} - ${await deleteRes.text()}`);
        }
    } catch (error) {
        console.error(`❌ Cleanup error for Product ${productId}:`, error);
    }
};

// Extend test mặc định của Playwright
export const dataTest = authTest.extend<TestData>({

    // Tạo Nhóm hàng
    category: async ({ request, authToken }, use) => {
        const categoryName = `Test Category`;

        console.log(`🔨 Creating category: ${categoryName}`);

        const res = await request.post(`${getBaseUrl()}/api/categories`, {
            headers: createHeaders(authToken),
            data: {
                Category: {
                    Id: 0,
                    Name: categoryName,
                    ParentId: 0
                },
                CompareCateName: ""
            },
        });

        if (!res.ok()) {
            const errorText = await res.text();
            throw new Error(`Category creation failed: ${res.status()} - ${errorText}`);
        }

        const category: CategoryResponse = await res.json();

        console.log('📋 API Response:', JSON.stringify(category, null, 2));

        // Validate response
        validateApiResponse(category, 'Category');

        console.log(`✅ Category created: ID=${category.Data.Id}, Name=${category.Data.Name}`);

        // Return the Data part for easier use in tests
        await use(category.Data);

        // Cleanup
        if (category.Data.Id) {
            await safeCleanupCategory(request, authToken, category.Data.Id);
        }
    },

    // Tạo hàng hóa
    product: async ({ request, authToken, category }, use) => {
        const productName = `Test Product`;
        const productCode = `TEST-PRODUCT`;

        console.log(`🔨 Creating product: ${productName} for category ID=${category.Id}`);

        // Tạo product data theo format từ curl
        const productData = {
            Id: 0,
            ProductGroup: 1,
            ProductType: 2,
            CategoryId: category.Id,
            CategoryName: "",
            isActive: true,
            AllowsSale: true,
            isDeleted: false,
            Code: productCode,
            BasePrice: 10000,
            Cost: 1000,
            LatestPurchasePrice: 0,
            OnHand: 100,
            OnHandCompareMin: 0,
            OnHandCompareMax: 0,
            CompareOnHand: 0,
            CompareCost: 0,
            CompareBasePrice: 0,
            CompareCode: "",
            CompareUnit: "",
            CompareProductGroup: 1,
            Reserved: 0,
            MinQuantity: 0,
            MaxQuantity: 999999999,
            CustomId: 0,
            CustomValue: 0,
            MasterProductId: 0,
            Unit: "",
            ConversionValue: 1,
            OrderTemplate: "",
            ListBranchHasPrivilege: [10351767], // Simplified list
            IsLotSerialControl: false,
            IsRewardPoint: true,
            HaveProcessedGoodsChild: false,
            AllowSaleForBranch: true,
            InventoryTrackingIgnore: false,
            ProductFormulas: [],
            Name: productName,
            ListPriceBookDetail: [],
            ProductImages: []
        };

        // Tạo multipart form data
        const formData = new FormData();
        formData.append('ListProducts', JSON.stringify([productData]));

        // Update headers cho multipart
        const multipartHeaders = {
            'Authorization': `Bearer ${authToken}`,
            'Retailer': process.env.RETAILER || 'testfnbz27b',
            'branchid': '10351767',
            'x-branch-id': '10351767',
            'x-retailer-code': process.env.RETAILER || 'testfnbz27b',
            'x-retailer-id': '760874',
            'x-app-name': 'web-man',
            'accept': 'application/json, text/plain, */*'
            // Không set Content-Type để browser tự set boundary
        };

        const res = await request.post(`${getBaseUrl()}/api/products/addmany`, {
            headers: multipartHeaders,
            multipart: {
                ListProducts: JSON.stringify([productData])
            }
        });

        if (!res.ok()) {
            const errorText = await res.text();
            throw new Error(`Product creation failed: ${res.status()} - ${errorText}`);
        }

        const response: ProductResponse = await res.json();

        console.log('📋 Product API Response:', JSON.stringify(response, null, 2));

        // Validate response
        validateApiResponse(response, 'Product');

        // Get first product from array response
        const product = response.Data[0];

        console.log(`✅ Product created: ID=${product.Id}, Name=${product.Name}`);

        await use(product);

        // Cleanup
        if (product.Id) {
            await safeCleanupProduct(request, authToken, product.Id);
        }
    },

    // Tạo Invoice tracker
    invoices: async ({ request, authToken }, use) => {
        const createdIds: number[] = [];

        console.log('🔨 Invoice tracker initialized');

        await use(createdIds);

        // Cleanup invoices
        console.log(`🧹 Cleaning up ${createdIds.length} invoices`);
        for (const id of createdIds) {
            try {
                const deleteRes = await request.delete(`${getBaseUrl()}/api/invoices/${id}`, {
                    headers: createHeaders(authToken),
                });

                if (deleteRes.ok()) {
                    console.log(`✅ Invoice deleted: ID=${id}`);
                } else {
                    console.warn(`⚠️ Failed to delete Invoice: ${deleteRes.status()} - ${await deleteRes.text()}`);
                }
            } catch (error) {
                console.error(`❌ Cleanup error for Invoice ${id}:`, error);
            }
        }
    },
});

export const expect = dataTest.expect;