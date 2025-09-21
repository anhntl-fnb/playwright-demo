import { APIRequestContext, expect } from "@playwright/test";

// TypeScript interfaces for API responses
interface InvoiceListItem {
    Id: number;
    Code: string;
    OrderCode: string;
    CreatedDate: string;
}

interface InvoiceListResponse {
    Data: InvoiceListItem[];
    Message: string;
    ResponseStatus?: {
        ErrorCode?: string;
        Message?: string;
    };
}

interface InvoiceDetail {
    Id: number;
    Code: string;
    OrderCode: string;
    CreatedDate: string;
    Total: number;
}

interface InvoiceDetailResponse {
    Data: InvoiceDetail;
    Message: string;
    ResponseStatus?: {
        ErrorCode?: string;
        Message?: string;
    };
}

export class InvoiceHelper {
    private readonly baseUrl: string;

    constructor(
        private request: APIRequestContext,
        private authToken: string
    ) {
        this.baseUrl = process.env.BASE_URL || 'https://fnb.kiotviet.vn';
    }

    /**
     * Create headers for API requests
     */
    private createHeaders() {
        return {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    /**
     * Validate API response and check for errors
     */
    private validateApiResponse(response: any, operation: string): void {
        if (response.ResponseStatus?.ErrorCode) {
            throw new Error(`${operation} failed: ${response.ResponseStatus.Message || 'Unknown error'}`);
        }

        // For invoice detail, sometimes the response structure is different
        // Check if it's a direct invoice object or wrapped in Data
        if (operation.includes('invoice detail')) {
            if (!response.Id && !response.Data?.Id) {
                throw new Error(`${operation} failed: No invoice data in response`);
            }
        } else {
            if (!response.Data) {
                throw new Error(`${operation} failed: No data in response`);
            }
        }
    }

    /**
     * Get invoice list from API
     */
    private async getInvoiceList(): Promise<InvoiceListResponse> {
        const url = `${this.baseUrl}/api/invoices?format=json`;

        try {
            console.log(`🔍 Fetching invoice list from: ${url}`);

            const response = await this.request.get(url, {
                headers: this.createHeaders(),
            });

            if (!response.ok()) {
                throw new Error(`API call failed with status: ${response.status()}`);
            }

            const data: InvoiceListResponse = await response.json();
            this.validateApiResponse(data, 'Get invoice list');

            return data;

        } catch (error) {
            console.error(`❌ Failed to get invoice list:`, error);
            throw new Error(`Failed to get invoice list: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get specific invoice details by ID
     */
    private async getInvoiceDetail(invoiceId: number): Promise<InvoiceDetailResponse> {
        const url = `${this.baseUrl}/api/invoices/${invoiceId}`;

        try {
            console.log(`🔍 Fetching invoice detail for ID: ${invoiceId}`);

            const response = await this.request.get(url, {
                headers: this.createHeaders(),
            });

            if (!response.ok()) {
                throw new Error(`API call failed with status: ${response.status()}`);
            }

            const data: any = await response.json();
            this.validateApiResponse(data, 'Get invoice detail');

            // Handle different response structures
            if (data.Id) {
                // Direct invoice object
                return { Data: data, Message: 'Success' };
            } else {
                // Wrapped in Data property
                return data;
            }

        } catch (error) {
            console.error(`❌ Failed to get invoice detail for ID ${invoiceId}:`, error);
            throw new Error(`Failed to get invoice detail: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Find invoice by order code in the invoice list
     */
    private findInvoiceByOrderCode(invoices: InvoiceListItem[], targetOrderCode: string): InvoiceListItem | null {
        // Look for exact match first
        let matchingInvoice = invoices.find(invoice => invoice.OrderCode === targetOrderCode);

        // If no exact match, try to find by partial match (in case of formatting differences)
        if (!matchingInvoice) {
            matchingInvoice = invoices.find(invoice =>
                invoice.OrderCode?.includes(targetOrderCode) ||
                targetOrderCode.includes(invoice.OrderCode)
            );
        }

        return matchingInvoice || null;
    }

    /**
     * Verify that an invoice exists for the given order code
     * @param orderCode - The order code to verify
     */
    async verifyInvoice(orderCode: string): Promise<void> {
        try {
            console.log(`🔍 Verifying invoice for order code: ${orderCode}`);

            // Step 1: Get the list of recent invoices
            const invoiceList = await this.getInvoiceList();

            if (!invoiceList.Data || invoiceList.Data.length === 0) {
                throw new Error('No invoices found in the system');
            }

            console.log(`📋 Found ${invoiceList.Data.length} invoices, looking for order code: ${orderCode}`);

            // Step 2: Find the invoice with matching order code
            const targetInvoice = this.findInvoiceByOrderCode(invoiceList.Data, orderCode);

            if (!targetInvoice) {
                console.error(`❌ Available order codes:`, invoiceList.Data.map(inv => inv.OrderCode));
                throw new Error(`Invoice with order code "${orderCode}" not found`);
            }

            console.log(`✅ Found matching invoice: ID=${targetInvoice.Id}, OrderCode=${targetInvoice.OrderCode}`);

            // Step 3: Get detailed information about the invoice
            const invoiceDetail = await this.getInvoiceDetail(targetInvoice.Id);

            // Step 4: Verify the order codes match exactly
            expect(invoiceDetail.Data.OrderCode).toBe(orderCode);

            console.log(`🎉 Invoice verification successful:`);
            console.log(`   - Invoice Code: ${invoiceDetail.Data.Code}`);
            console.log(`   - Order Code: ${invoiceDetail.Data.OrderCode}`);
            console.log(`   - Invoice ID: ${invoiceDetail.Data.Id}`);

        } catch (error) {
            console.error(`❌ Invoice verification failed for order code "${orderCode}":`, error);
            throw error; // Re-throw to fail the test
        }
    }

    /**
     * Get invoice details by order code (utility method)
     * @param orderCode - The order code to look up
     * @returns Invoice details if found
     */
    async getInvoiceByOrderCode(orderCode: string): Promise<InvoiceDetail> {
        const invoiceList = await this.getInvoiceList();
        const targetInvoice = this.findInvoiceByOrderCode(invoiceList.Data, orderCode);

        if (!targetInvoice) {
            throw new Error(`Invoice with order code "${orderCode}" not found`);
        }

        const invoiceDetail = await this.getInvoiceDetail(targetInvoice.Id);
        return invoiceDetail.Data;
    }
}