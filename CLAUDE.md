# Playwright Test Automation - KiotViet F&B POS System

This project contains E2E test automation for the KiotViet F&B (Food & Beverage) Point of Sale system using Playwright with TypeScript.

## Project Structure

```
├── fixtures/                 # Test fixtures and data management
│   ├── auth.fixture.ts       # Authentication setup with two user types
│   └── data.fixture.ts       # Dynamic test data creation/cleanup
├── helpers/                  # Utility functions
│   └── invoiceHelper.ts      # Invoice operations and verification
├── pages/                    # Page Object Model implementations
│   ├── LoginPage.ts          # Login functionality for both user types
│   ├── CashierPage.ts        # POS cashier operations
│   └── ManagePage.ts         # Management interface (tables, products)
├── tests/                    # Test specifications
│   ├── login.spec.ts         # ✅ Login functionality tests (6 scenarios)
│   ├── cashier.spec.ts       # ✅ Payment flow end-to-end test
│   ├── manage.spec.ts        # ✅ CRUD operations (tables & products)
│   └── data-test.spec.ts     # ✅ Data fixture validation test
├── playwright.config.ts      # Test configuration
├── .env                      # Environment variables (gitignored)
└── .env.example             # Environment template
```

## Test Architecture & Patterns

### 🔐 Authentication Strategy
- **Dual Authentication**: Support for both Management (`authPageMan`) and POS (`authPagePos`) user types
- **Token-Based API Access**: Direct API login for Bearer token generation
- **Fixture-Based Login**: Automatic authentication before test execution

### 🏗️ Page Object Model
- **LoginPage**: Handles both management and POS login flows
- **CashierPage**: POS operations, order creation, payment processing
- **ManagePage**: Administrative functions (table/product CRUD)

### 🎯 Advanced Test Patterns
- **Hybrid UI + API Testing**: UI actions verified via API calls
- **Dynamic Test Data**: Runtime creation of categories/products with automatic cleanup
- **Retry Logic**: Intelligent waiting for data synchronization between systems
- **Comprehensive Cleanup**: Automatic teardown of test data after execution

### 📊 Data Management
- **data.fixture.ts**: Creates temporary categories and products for testing
- **Automatic Cleanup**: All test data removed after test completion
- **API Validation**: Test data verified via REST API calls

## Configuration

### Environment Variables (.env)
```env
# Application Settings
BASE_URL=https://fnb.kiotviet.vn
RETAILER=testfnbz27b

# Authentication
TEST_USERNAME=anhntl
TEST_PASSWORD=123

# Test Settings
CI=false
HEADLESS=false
```

### Playwright Configuration
- **Base URL**: `https://fnb.kiotviet.vn`
- **Parallel Execution**: Enabled for performance
- **Workers**: 2 workers locally, 1 on CI
- **Retries**: 2 retries on CI, 0 locally
- **Timeout**: 60s tests, 10s assertions
- **Browser**: Chromium (Chrome simulation)
- **Custom Headers**: Includes `Retailer` header for API requests
- **Branch Context**: Configured for branch ID `10351767`
- **Reporter**: HTML reporter for test results

## Test Completion Status

### ✅ Completed Test Suites

#### 1. **login.spec.ts** (6 scenarios)
- ✅ Management login success
- ✅ POS login success
- ✅ Missing store name validation
- ✅ Missing username validation
- ✅ Missing password validation
- ✅ Invalid credentials handling

#### 2. **cashier.spec.ts** (1 complex scenario)
- ✅ End-to-end payment flow with:
  - Dynamic product/category creation via API
  - UI synchronization verification
  - Order creation and payment processing
  - API-based invoice verification
  - Automatic test data cleanup

#### 3. **manage.spec.ts** (6 CRUD scenarios)
- ✅ Table management: Create, Update, Delete
- ✅ Product management: Create, Update, Delete

#### 4. **data-test.spec.ts** (1 validation test)
- ✅ Data fixture validation (category & product creation)

### 🔄 Test Dependencies
Tests use sophisticated fixture dependencies:
- `authToken` → API authentication token
- `authPageMan` → Authenticated management session
- `authPagePos` → Authenticated POS session
- `category` → Dynamically created test category
- `product` → Test product linked to category

## Common Commands

```bash
# Run all tests
npx playwright test

# Run specific test suite
npx playwright test tests/login.spec.ts
npx playwright test tests/cashier.spec.ts
npx playwright test tests/manage.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run only setup tests
npx playwright test --project=setup

# Debug specific test
npx playwright test tests/cashier.spec.ts --debug

# View test reports
npx playwright show-report

# Generate new test code
npx playwright codegen https://fnb.kiotviet.vn
```

## Development Guidelines

### 🎯 Test Patterns to Follow
1. **Fixture-First**: Use authentication and data fixtures for setup
2. **API + UI Verification**: Validate UI actions with API calls
3. **Automatic Cleanup**: Always clean up test data
4. **Descriptive Vietnamese Test Names**: Tests use Vietnamese business terminology
5. **Retry Logic**: Implement waits for data synchronization

### 🔧 Adding New Tests
1. Use appropriate fixture (`authTest` for auth, `dataTest` for data)
2. Follow Page Object Model pattern
3. Include cleanup for any created data
4. Add API verification where applicable
5. Use Vietnamese test descriptions matching business requirements

### 🏷️ Key APIs Used
- **Authentication**: `/api/users/auth-login`
- **Categories**: `/api/categories` (POST/DELETE)
- **Products**: `/api/products/addmany` (POST), `/api/products/{id}` (DELETE)
- **Invoices**: Invoice creation and verification endpoints

## Recent Updates

### Latest Changes (September 2025)
- **Login Function Updates**: Enhanced login functionality (commit: fb19b7b)
- **Invoice Verification**: Updated invoiceHelper.ts with improved invoice verification logic
- **Test Stability**: Improved cashier.spec.ts test reliability
- **Data Management**: Enhanced data fixture handling and cleanup mechanisms

## Project Notes

- **Language**: Test descriptions in Vietnamese for business stakeholder clarity
- **Test Data**: All test entities use "Test" prefix for easy identification
- **Branch Specific**: Configured for branch ID `10351767`
- **Retailer Context**: Uses `testfnbz27b` as default test retailer
- **Error Handling**: Comprehensive error handling with detailed logging
- **Performance**: Tests optimized with parallel data creation and UI synchronization
- **Dependencies**: Uses Playwright 1.55.0 with TypeScript support

This is a production-ready test suite with advanced patterns for reliable E2E testing of a complex POS system.