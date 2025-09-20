import { dataTest as test, expect } from '../fixtures/data.fixture';

test('Test category and product creation', async ({ category, product }) => {
    // Test category
    expect(category).toBeDefined();
    expect(category.Id).toBeGreaterThan(0);
    expect(category.Name).toContain('category-');

    console.log('✅ Category test passed:', {
        Id: category.Id,
        Name: category.Name
    });

    // Test product
    expect(product).toBeDefined();
    expect(product.Id).toBeGreaterThan(0);
    expect(product.Name).toContain('product-');
    expect(product.CategoryId).toBe(category.Id);

    console.log('✅ Product test passed:', {
        Id: product.Id,
        Name: product.Name,
        CategoryId: product.CategoryId
    });
});