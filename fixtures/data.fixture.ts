import { authTest } from './auth.fixture';


// Khai báo type cho fixture mới
type TestData = {
    category: { Id: number; Name: string };
    product: { Id: number; Name: string };
    invoices: number[]; // lưu lại danh sách invoice Id để xoá sau
};

// Extend test mặc định của Playwright
export const dataTest = authTest.extend<TestData>({

    // Tạo Nhóm hàng
    category: async ({ request, authToken }, use) => {
        const res = await request.post('https://fnb.kiotviet.vn/api/categories', {
            headers: { Authorization: `Bearer ${authToken}` },
            data: {
                name: `category-${Date.now()}`,
                //code: `C-${Date.now()}`,
            },
        });
        const category = await res.json();

        await use(category);

        // Xóa nhóm hàng
        await request.delete(`/api/categories/${category.Id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
    },

    // Tạo hàng hóa
    product: async ({ request, authToken, category }, use) => {
        const res = await request.post('https://fnb.kiotviet.vn/api/products/addmany', {
            headers: { Authorization: `Bearer ${authToken}` },
            data: {
                name: `product-${Date.now()}`,
                code: `P-${Date.now()}`,
                categoryId: category.Id,
                price: 10000,
            },
        });
        const product = await res.json();

        await use(product);

        // Xóa hàng hóa
        await request.delete(`/api/products/${product.Id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
    },

    // Tạo Invoice
    invoices: async ({ request, authToken }, use) => {
        const createdIds: number[] = [];

        await use(createdIds);

        // Xóa Invoices
        for (const id of createdIds) {
            await request.delete(`/api/invoices/${id}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
        }
    },
});

export const expect = dataTest.expect;