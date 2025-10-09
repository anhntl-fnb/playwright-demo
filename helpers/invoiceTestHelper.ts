import { APIRequestContext } from '@playwright/test';

export interface InvoiceItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
}

export interface Invoice {
    id: number;
    invoiceNumber: string;
    date: string;
    customer?: string;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    status: 'Paid' | 'Void' | 'Pending';
    paymentMethod?: string;
    cashier?: string;
    voidReason?: string;
    voidedAt?: string;
    voidedBy?: string;
}

/**
 * Helper class for invoice-related API operations and verification
 */
export class InvoiceTestHelper {
    private baseUrl: string;
    private retailer: string;

    constructor(baseUrl: string = 'https://fnb.kiotviet.vn', retailer: string = 'testfnbz27b') {
        this.baseUrl = baseUrl;
        this.retailer = retailer;
    }

    /**
     * Creates a test invoice via API
     * @param request - Playwright APIRequestContext
     * @param token - Authentication token
     * @param items - Invoice items
     * @param customer - Customer name (optional)
     * @returns Created invoice data
     */
    async createTestInvoice(
        request: APIRequestContext,
        token: string,
        items: InvoiceItem[],
        customer?: string
    ): Promise<Invoice> {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const tax = subtotal * 0.1; // 10% tax
        const discount = 0;
        const total = subtotal + tax - discount;

        const response = await request.post(`${this.baseUrl}/api/invoices`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Retailer': this.retailer,
                'Content-Type': 'application/json'
            },
            data: {
                customer: customer || 'Test Customer',
                items: items,
                subtotal: subtotal,
                tax: tax,
                discount: discount,
                total: total,
                paymentMethod: 'Cash',
                status: 'Paid'
            }
        });

        if (!response.ok()) {
            throw new Error(`Failed to create invoice: ${response.status()} ${await response.text()}`);
        }

        return await response.json();
    }

    /**
     * Retrieves an invoice by ID via API
     * @param request - Playwright APIRequestContext
     * @param token - Authentication token
     * @param invoiceId - Invoice ID
     * @returns Invoice data
     */
    async getInvoiceById(
        request: APIRequestContext,
        token: string,
        invoiceId: number
    ): Promise<Invoice> {
        const response = await request.get(`${this.baseUrl}/api/invoices/${invoiceId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Retailer': this.retailer
            }
        });

        if (!response.ok()) {
            throw new Error(`Failed to get invoice: ${response.status()} ${await response.text()}`);
        }

        return await response.json();
    }

    /**
     * Voids an invoice with a reason
     * @param request - Playwright APIRequestContext
     * @param token - Authentication token
     * @param invoiceId - Invoice ID to void
     * @param reason - Reason for voiding
     */
    async voidInvoice(
        request: APIRequestContext,
        token: string,
        invoiceId: number,
        reason: string
    ): Promise<void> {
        const response = await request.post(`${this.baseUrl}/api/invoices/${invoiceId}/void`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Retailer': this.retailer,
                'Content-Type': 'application/json'
            },
            data: {
                reason: reason
            }
        });

        if (!response.ok()) {
            throw new Error(`Failed to void invoice: ${response.status()} ${await response.text()}`);
        }
    }

    /**
     * Searches for invoices with filters
     * @param request - Playwright APIRequestContext
     * @param token - Authentication token
     * @param filters - Search filters
     * @returns Array of invoices matching filters
     */
    async searchInvoices(
        request: APIRequestContext,
        token: string,
        filters: {
            dateFrom?: string;
            dateTo?: string;
            invoiceNumber?: string;
            customer?: string;
            status?: string;
            amountFrom?: number;
            amountTo?: number;
        }
    ): Promise<Invoice[]> {
        const params = new URLSearchParams();

        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);
        if (filters.invoiceNumber) params.append('invoiceNumber', filters.invoiceNumber);
        if (filters.customer) params.append('customer', filters.customer);
        if (filters.status) params.append('status', filters.status);
        if (filters.amountFrom) params.append('amountFrom', filters.amountFrom.toString());
        if (filters.amountTo) params.append('amountTo', filters.amountTo.toString());

        const response = await request.get(`${this.baseUrl}/api/invoices?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Retailer': this.retailer
            }
        });

        if (!response.ok()) {
            throw new Error(`Failed to search invoices: ${response.status()} ${await response.text()}`);
        }

        return await response.json();
    }

    /**
     * Verifies invoice data consistency between UI and API
     * @param uiData - Invoice data from UI
     * @param apiData - Invoice data from API
     * @returns True if data matches, false otherwise
     */
    verifyInvoiceData(uiData: Partial<Invoice>, apiData: Invoice): boolean {
        const checks: boolean[] = [];

        if (uiData.invoiceNumber) {
            checks.push(uiData.invoiceNumber === apiData.invoiceNumber);
        }

        if (uiData.total !== undefined) {
            // Allow small floating point differences
            checks.push(Math.abs(uiData.total - apiData.total) < 0.01);
        }

        if (uiData.status) {
            checks.push(uiData.status === apiData.status);
        }

        if (uiData.customer) {
            checks.push(uiData.customer === apiData.customer);
        }

        if (uiData.date) {
            // Compare dates (normalize formats)
            const uiDate = new Date(uiData.date).toDateString();
            const apiDate = new Date(apiData.date).toDateString();
            checks.push(uiDate === apiDate);
        }

        return checks.every(check => check === true);
    }

    /**
     * Deletes an invoice (for cleanup)
     * @param request - Playwright APIRequestContext
     * @param token - Authentication token
     * @param invoiceId - Invoice ID to delete
     */
    async deleteInvoice(
        request: APIRequestContext,
        token: string,
        invoiceId: number
    ): Promise<void> {
        const response = await request.delete(`${this.baseUrl}/api/invoices/${invoiceId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Retailer': this.retailer
            }
        });

        if (!response.ok()) {
            // Don't throw error if already deleted (404)
            if (response.status() !== 404) {
                console.warn(`Failed to delete invoice ${invoiceId}: ${response.status()}`);
            }
        }
    }
}
