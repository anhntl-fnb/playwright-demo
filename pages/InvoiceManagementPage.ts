import { Page, Locator, expect, Download } from '@playwright/test';
import { Invoice } from '../helpers/invoiceTestHelper';

/**
 * Page Object Model for Invoice Management functionality
 */
export class InvoiceManagementPage {
    readonly page: Page;

    // Main page elements
    readonly invoiceList: Locator;
    readonly searchDateFrom: Locator;
    readonly searchDateTo: Locator;
    readonly searchInvoiceNumber: Locator;
    readonly searchCustomer: Locator;
    readonly searchButton: Locator;
    readonly filterStatus: Locator;
    readonly paginationNext: Locator;
    readonly paginationPrev: Locator;
    readonly invoiceCountText: Locator;

    // Invoice detail elements
    readonly invoiceDetailModal: Locator;
    readonly invoiceDetailNumber: Locator;
    readonly invoiceDetailDate: Locator;
    readonly invoiceDetailCustomer: Locator;
    readonly invoiceDetailTotal: Locator;
    readonly invoiceDetailStatus: Locator;
    readonly invoiceDetailItems: Locator;

    // Void invoice elements
    readonly voidButton: Locator;
    readonly voidReasonInput: Locator;
    readonly voidConfirmButton: Locator;
    readonly voidCancelButton: Locator;

    // Export elements
    readonly exportPDFButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Main page locators
        this.invoiceList = page.locator('#invoice-list, .invoice-table, [data-testid="invoice-list"]');
        this.searchDateFrom = page.locator('#date-from, input[name="dateFrom"]');
        this.searchDateTo = page.locator('#date-to, input[name="dateTo"]');
        this.searchInvoiceNumber = page.locator('#invoice-number, input[name="invoiceNumber"]');
        this.searchCustomer = page.locator('#customer-name, input[name="customer"]');
        this.searchButton = page.locator('button:has-text("Tìm kiếm"), button[type="submit"]');
        this.filterStatus = page.locator('#status-filter, select[name="status"]');
        this.paginationNext = page.locator('.pagination-next, button:has-text("Tiếp")');
        this.paginationPrev = page.locator('.pagination-prev, button:has-text("Trước")');
        this.invoiceCountText = page.locator('.invoice-count, .total-count');

        // Invoice detail locators
        this.invoiceDetailModal = page.locator('.invoice-detail-modal, #invoice-detail');
        this.invoiceDetailNumber = page.locator('.invoice-number, [data-field="invoiceNumber"]');
        this.invoiceDetailDate = page.locator('.invoice-date, [data-field="date"]');
        this.invoiceDetailCustomer = page.locator('.invoice-customer, [data-field="customer"]');
        this.invoiceDetailTotal = page.locator('.invoice-total, [data-field="total"]');
        this.invoiceDetailStatus = page.locator('.invoice-status, [data-field="status"]');
        this.invoiceDetailItems = page.locator('.invoice-items, [data-field="items"]');

        // Void invoice locators
        this.voidButton = page.locator('button:has-text("Hủy hóa đơn"), button#void-invoice');
        this.voidReasonInput = page.locator('#void-reason, textarea[name="voidReason"]');
        this.voidConfirmButton = page.locator('button:has-text("Xác nhận"), button#confirm-void');
        this.voidCancelButton = page.locator('button:has-text("Hủy bỏ"), button#cancel-void');

        // Export locators
        this.exportPDFButton = page.locator('button:has-text("Xuất PDF"), button#export-pdf');
    }

    /**
     * Navigate to Invoice Management page
     * Flow: Manage page > Giao dịch tab > Hóa đơn > Click "vào đây"
     */
    async goto(): Promise<void> {
        // Navigate to manage page
        await this.page.goto('/manage');

        // Click "Giao dịch" tab
        const giaodicTabLocator = this.page.locator('a:has-text("Giao dịch"), button:has-text("Giao dịch"), [data-tab="giaodich"]');
        await giaodicTabLocator.click();

        // Click "Hóa đơn" menu item
        const hoadonMenuLocator = this.page.locator('a:has-text("Hóa đơn"), [href*="hoadon"]');
        await hoadonMenuLocator.click();

        // Click "vào đây" to list all invoices
        const vaodayButtonLocator = this.page.locator('a:has-text("vào đây"), button:has-text("vào đây")');
        await vaodayButtonLocator.click();

        // Wait for invoice list to load
        await this.waitForInvoiceList();
    }

    /**
     * Wait for invoice list to load
     */
    async waitForInvoiceList(): Promise<void> {
        await this.invoiceList.waitFor({ state: 'visible', timeout: 10000 });
    }

    /**
     * Search invoices by date range
     * @param dateFrom - Start date (YYYY-MM-DD)
     * @param dateTo - End date (YYYY-MM-DD)
     */
    async searchByDateRange(dateFrom: string, dateTo: string): Promise<void> {
        await this.searchDateFrom.fill(dateFrom);
        await this.searchDateTo.fill(dateTo);
        await this.searchButton.click();
        await this.waitForInvoiceList();
    }

    /**
     * Search invoice by invoice number
     * @param invoiceNumber - Invoice number to search
     */
    async searchByInvoiceNumber(invoiceNumber: string): Promise<void> {
        await this.searchInvoiceNumber.fill(invoiceNumber);
        await this.searchButton.click();
        await this.waitForInvoiceList();
    }

    /**
     * Search invoices by customer name
     * @param customerName - Customer name to search
     */
    async searchByCustomer(customerName: string): Promise<void> {
        await this.searchCustomer.fill(customerName);
        await this.searchButton.click();
        await this.waitForInvoiceList();
    }

    /**
     * Filter invoices by status
     * @param status - Status to filter (Paid, Void, Pending)
     */
    async filterByStatus(status: 'Paid' | 'Void' | 'Pending'): Promise<void> {
        await this.filterStatus.selectOption(status);
        await this.waitForInvoiceList();
    }

    /**
     * Click on a specific invoice to view details
     * @param invoiceNumber - Invoice number to click
     */
    async clickInvoice(invoiceNumber: string): Promise<void> {
        const invoiceRow = this.page.locator(`tr:has-text("${invoiceNumber}"), .invoice-row:has-text("${invoiceNumber}")`);
        await invoiceRow.click();
        await this.invoiceDetailModal.waitFor({ state: 'visible' });
    }

    /**
     * Get invoice row locator by invoice number
     * @param invoiceNumber - Invoice number
     * @returns Locator for the invoice row
     */
    getInvoiceRow(invoiceNumber: string): Locator {
        return this.page.locator(`tr:has-text("${invoiceNumber}"), .invoice-row:has-text("${invoiceNumber}")`);
    }

    /**
     * Check if invoice is visible in the list
     * @param invoiceNumber - Invoice number to check
     * @returns True if invoice is visible
     */
    async isInvoiceVisible(invoiceNumber: string): Promise<boolean> {
        return await this.getInvoiceRow(invoiceNumber).isVisible();
    }

    /**
     * Get invoice status from the list
     * @param invoiceNumber - Invoice number
     * @returns Invoice status
     */
    async getInvoiceStatus(invoiceNumber: string): Promise<string> {
        const row = this.getInvoiceRow(invoiceNumber);
        const statusCell = row.locator('.status, td.invoice-status, [data-field="status"]');
        return await statusCell.textContent() || '';
    }

    /**
     * Get total count of invoices
     * @returns Total invoice count
     */
    async getInvoiceCount(): Promise<number> {
        const countText = await this.invoiceCountText.textContent();
        if (!countText) return 0;

        const match = countText.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    }

    /**
     * Extract invoice data from detail view
     * @returns Partial invoice object with UI data
     */
    async getInvoiceData(): Promise<Partial<Invoice>> {
        await this.invoiceDetailModal.waitFor({ state: 'visible' });

        const invoiceNumber = await this.invoiceDetailNumber.textContent() || '';
        const date = await this.invoiceDetailDate.textContent() || '';
        const customer = await this.invoiceDetailCustomer.textContent() || '';
        const totalText = await this.invoiceDetailTotal.textContent() || '0';
        const status = await this.invoiceDetailStatus.textContent() || '';

        // Parse total (remove currency symbols and commas)
        const total = parseFloat(totalText.replace(/[^\d.]/g, ''));

        return {
            invoiceNumber: invoiceNumber.trim(),
            date: date.trim(),
            customer: customer.trim(),
            total: total,
            status: status.trim() as 'Paid' | 'Void' | 'Pending'
        };
    }

    /**
     * Void the currently displayed invoice
     * @param reason - Reason for voiding the invoice
     */
    async voidInvoice(reason: string): Promise<void> {
        await this.voidButton.click();
        await this.voidReasonInput.waitFor({ state: 'visible' });
        await this.voidReasonInput.fill(reason);
        await this.voidConfirmButton.click();

        // Wait for void operation to complete
        await this.page.waitForTimeout(1000);
    }

    /**
     * Check if void button is enabled
     * @returns True if void button is enabled
     */
    async isVoidButtonEnabled(): Promise<boolean> {
        return await this.voidButton.isEnabled();
    }

    /**
     * Export invoice as PDF
     * @returns Download object for the PDF file
     */
    async exportPDF(): Promise<Download> {
        const downloadPromise = this.page.waitForEvent('download');
        await this.exportPDFButton.click();
        const download = await downloadPromise;
        return download;
    }

    /**
     * Navigate to next page of invoices
     */
    async goToNextPage(): Promise<void> {
        await this.paginationNext.click();
        await this.waitForInvoiceList();
    }

    /**
     * Navigate to previous page of invoices
     */
    async goToPreviousPage(): Promise<void> {
        await this.paginationPrev.click();
        await this.waitForInvoiceList();
    }

    /**
     * Clear all search filters
     */
    async clearFilters(): Promise<void> {
        await this.searchInvoiceNumber.clear();
        await this.searchCustomer.clear();
        await this.searchDateFrom.clear();
        await this.searchDateTo.clear();
        await this.searchButton.click();
        await this.waitForInvoiceList();
    }
}
