import { Page, Locator, expect } from '@playwright/test';

interface LoginCredentials {
    retailer: string;
    username: string;
    password: string;
}

interface LoginElements {
    retailerInput: Locator;
    usernameInput: Locator;
    passwordInput: Locator;
    managementButton: Locator;
    posButton: Locator;
    errorContainer: Locator;
    form: Locator;
}

export class LoginPage {
    private readonly page: Page;
    private readonly elements: LoginElements;
    private readonly baseUrl: string;

    constructor(page: Page) {
        this.page = page;
        this.baseUrl = process.env.BASE_URL || 'https://fnb.kiotviet.vn';

        // Initialize element selectors based on actual HTML structure
        this.elements = {
            retailerInput: page.locator('#Retailer'),
            usernameInput: page.locator('#UserName'),
            passwordInput: page.locator('#Password'),
            managementButton: page.locator('#btn-login'),
            posButton: page.locator('#loginNewSale'),
            errorContainer: page.locator('.validation-summary-errors'),
            form: page.locator('#loginForm')
        };
    }

    async goto(): Promise<void> {
        await this.page.goto(this.baseUrl);
        await this.page.waitForLoadState('domcontentloaded');

        // Wait for form to be visible
        await this.elements.form.waitFor({ state: 'visible' });
    }

    private async fillCredentials(credentials: LoginCredentials): Promise<void> {
        // Clear and fill retailer field
        if (credentials.retailer) {
            await this.elements.retailerInput.clear();
            await this.elements.retailerInput.fill(credentials.retailer);
        }

        // Clear and fill username field
        if (credentials.username) {
            await this.elements.usernameInput.clear();
            await this.elements.usernameInput.fill(credentials.username);
        }

        // Clear and fill password field
        if (credentials.password) {
            await this.elements.passwordInput.clear();
            await this.elements.passwordInput.fill(credentials.password);
        }
    }

    async loginMan(retailer: string, username: string, password: string): Promise<void> {
        await this.fillCredentials({ retailer, username, password });
        await this.elements.managementButton.click();

        // Wait for navigation or error message
        await Promise.race([
            this.page.waitForURL('**/*', { timeout: 10000 }),
            this.elements.errorContainer.waitFor({ state: 'visible', timeout: 10000 })
        ]).catch(() => {
            // Ignore timeout - will be handled by test assertions
        });
    }

    async loginPos(retailer: string, username: string, password: string): Promise<void> {
        await this.fillCredentials({ retailer, username, password });
        await this.elements.posButton.click();

        // Wait for navigation or error message
        await Promise.race([
            this.page.waitForURL('**/*', { timeout: 10000 }),
            this.elements.errorContainer.waitFor({ state: 'visible', timeout: 10000 })
        ]).catch(() => {
            // Ignore timeout - will be handled by test assertions
        });
    }

    async expectErrorMessage(expectedMessage: string): Promise<void> {
        // Wait for error container to appear
        await this.elements.errorContainer.waitFor({
            state: 'visible',
            timeout: 10000
        });

        // Check if the error message contains the expected text
        await expect(this.elements.errorContainer).toContainText(expectedMessage);
    }

    async isErrorMessageVisible(): Promise<boolean> {
        try {
            await this.elements.errorContainer.waitFor({
                state: 'visible',
                timeout: 5000
            });
            return true;
        } catch {
            return false;
        }
    }

    async getErrorMessage(): Promise<string | null> {
        try {
            await this.elements.errorContainer.waitFor({
                state: 'visible',
                timeout: 5000
            });
            return await this.elements.errorContainer.textContent();
        } catch {
            return null;
        }
    }

    async clearForm(): Promise<void> {
        // Clear browser storage that might auto-fill the form
        await this.page.evaluate(() => {
            localStorage.removeItem('retailer');
            localStorage.removeItem('kvSession');
            localStorage.removeItem('retailerId');
            // Clear all localStorage keys starting with 'offline_ss_'
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('offline_ss_')) {
                    localStorage.removeItem(key);
                }
            });
        });

        // Clear form fields
        await this.elements.retailerInput.clear();
        await this.elements.usernameInput.clear();
        await this.elements.passwordInput.clear();

        // Wait a moment for any auto-fill to be cleared
        await this.page.waitForTimeout(500);
    }

    async isFormVisible(): Promise<boolean> {
        return await this.elements.form.isVisible();
    }

    // Helper methods for getting current field values
    async getRetailerValue(): Promise<string> {
        return await this.elements.retailerInput.inputValue();
    }

    async getUsernameValue(): Promise<string> {
        return await this.elements.usernameInput.inputValue();
    }

    async getPasswordValue(): Promise<string> {
        return await this.elements.passwordInput.inputValue();
    }

    // Helper methods to check if buttons are enabled
    async isManagementButtonEnabled(): Promise<boolean> {
        return await this.elements.managementButton.isEnabled();
    }

    async isPosButtonEnabled(): Promise<boolean> {
        return await this.elements.posButton.isEnabled();
    }
}