# Cucumber/Gherkin Integration with Playwright

## Overview

This project now supports **Gherkin/BDD testing** using Cucumber alongside traditional Playwright tests.

## Project Structure

```
├── features/                    # Gherkin feature files
│   ├── login.feature           # Login scenarios in Vietnamese
│   ├── manage.feature          # Table & Product management scenarios
│   └── cashier.feature         # Payment flow scenarios
├── steps/                      # Step definitions
│   ├── login.steps.ts          # Login step implementations
│   ├── manage.steps.ts         # Management step implementations
│   └── cashier.steps.ts        # Cashier step implementations
├── support/                    # Cucumber support files
│   ├── world.ts               # Custom World with Playwright integration
│   └── hooks.ts               # Before/After hooks
├── cucumber.js                # Cucumber configuration
└── tsconfig.json              # TypeScript configuration
```

## Running Cucumber Tests

### Run all feature files
```bash
npm run test:cucumber
```

### Run specific feature
```bash
npm run test:cucumber:login
npm run test:cucumber:manage
npm run test:cucumber:cashier
```

### Run with tags (if you add tags to features)
```bash
npx cucumber-js --tags "@smoke"
npx cucumber-js --tags "@login and not @slow"
```

## Feature File Examples

### Login Feature (`features/login.feature`)
```gherkin
# language: vi
Tính năng: Đăng nhập hệ thống KiotViet F&B

  Kịch bản: Đăng nhập Màn hình quản lý thành công
    Cho trước người dùng đang ở trang đăng nhập
    Khi người dùng đăng nhập MHQL với thông tin hợp lệ
    Thì hệ thống hiển thị trang "Tổng quan"
```

### Manage Feature (`features/manage.feature`)
```gherkin
# language: vi
Tính năng: Quản lý Phòng/Bàn và Hàng hóa

  Kịch bản: Thêm mới phòng bàn thành công
    Cho trước người dùng đã đăng nhập MHQL thành công
    Khi người dùng vào menu "Phòng/Bàn"
    Và người dùng thêm mới bàn với thông tin:
      | Tên bàn   | Nhóm    | Vị trí | Số ghế | Ghi chú  |
      | Bàn 1     | Nhóm 1  | 1      | 4      | Bàn test |
    Thì hệ thống hiển thị bàn "Bàn 1" trong danh sách
```

## Key Features

### ✅ Vietnamese Gherkin Support
All feature files use Vietnamese keywords:
- `Tính năng` (Feature)
- `Bối cảnh` (Background)
- `Kịch bản` (Scenario)
- `Cho trước` (Given)
- `Khi` (When)
- `Và` (And)
- `Thì` (Then)

### ✅ Playwright Integration
- Custom World class extends Cucumber World with Playwright Browser/Page
- Reuses existing Page Object Model (LoginPage, CashierPage, ManagePage)
- Shares fixtures and helpers with traditional Playwright tests

### ✅ Step Definitions with TypeScript
All step definitions are written in TypeScript with full type safety:
```typescript
Given('người dùng đang ở trang đăng nhập', async function (this: CustomWorld) {
  if (!this.page) throw new Error('Page is not initialized');
  const loginPage = new LoginPage(this.page);
  await loginPage.goto();
});
```

### ✅ Automatic Browser Management
- `Before` hook: Initializes browser, context, and page
- `After` hook: Cleans up browser resources

## Configuration

### `cucumber.js`
```javascript
module.exports = {
  default: {
    require: ['steps/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:cucumber-report.html',
      'json:cucumber-report.json'
    ]
  }
};
```

### Environment Variables
Same `.env` file used for both Playwright and Cucumber tests:
```env
BASE_URL=https://fnb.kiotviet.vn
RETAILER=testfnbz27b
TEST_USERNAME=anhntl
TEST_PASSWORD=123
HEADLESS=false
```

## Comparison: Playwright vs Cucumber

### Traditional Playwright Test
```typescript
test('Login MHQL thành công', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginMan(
        process.env.RETAILER || "testfnbz27b",
        process.env.TEST_USERNAME || "anhntl",
        process.env.TEST_PASSWORD || "123"
    );
    await expect(page.getByText("Tổng quan")).toBeVisible();
});
```

### Cucumber/Gherkin Test
```gherkin
Kịch bản: Đăng nhập Màn hình quản lý thành công
  Cho trước người dùng đang ở trang đăng nhập
  Khi người dùng đăng nhập MHQL với thông tin hợp lệ
  Thì hệ thống hiển thị trang "Tổng quan"
```

## Reports

After running tests, reports are generated:
- **HTML Report**: `cucumber-report.html` - Open in browser
- **JSON Report**: `cucumber-report.json` - For CI/CD integration

## Adding New Tests

### 1. Create Feature File
```gherkin
# features/new-feature.feature
# language: vi
Tính năng: Tên tính năng

  Kịch bản: Tên kịch bản
    Cho trước điều kiện ban đầu
    Khi hành động được thực hiện
    Thì kết quả mong đợi
```

### 2. Create Step Definitions
```typescript
// steps/new-feature.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';

Given('điều kiện ban đầu', async function (this: CustomWorld) {
  // Implementation
});

When('hành động được thực hiện', async function (this: CustomWorld) {
  // Implementation
});

Then('kết quả mong đợi', async function (this: CustomWorld) {
  // Implementation
});
```

### 3. Add npm script (optional)
```json
"test:cucumber:new-feature": "cucumber-js features/new-feature.feature"
```

## Best Practices

1. **Reuse Page Objects**: Don't duplicate code - reuse existing Page Objects from `pages/`
2. **Keep Steps Simple**: Steps should be thin wrappers around Page Object methods
3. **Use Background**: For common setup across scenarios, use `Bối cảnh` (Background)
4. **Data Tables**: Use data tables for complex input data
5. **Share Test Data**: Use the same fixtures and helpers as Playwright tests

## Troubleshooting

### Issue: Steps not found
- Check `cucumber.js` has correct `require` path: `steps/**/*.ts`
- Ensure `ts-node/register` is in `requireModule`

### Issue: TypeScript errors
- Run `npm install` to ensure all dependencies installed
- Check `tsconfig.json` includes `@cucumber/cucumber` types

### Issue: Browser not closing
- Check `After` hook in `support/hooks.ts` is executing
- Ensure `cleanup()` method is called

## Migration Strategy

You can run **both** Playwright and Cucumber tests in the same project:

```bash
# Run traditional Playwright tests
npm test

# Run Cucumber tests
npm run test:cucumber

# Run specific test type
npx playwright test tests/login.spec.ts
npm run test:cucumber:login
```

This allows gradual migration or maintaining both approaches based on team preference.
