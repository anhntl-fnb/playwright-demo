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

interface InvoiceDetailItem {
    ProductId: number;
    ProductName: string;
    Quantity: number;
    Price: number;
}

interface InvoiceDetail {
    Id: number;
    Code: string;
    OrderCode: string;
    CreatedDate: string;
    Total: number;
    InvoiceDetails?: InvoiceDetailItem[];
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
     * Create headers for API requests (matching real API requirements)
     */
    private createHeaders() {
        return {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'branchid': '10351767',
            'x-app-name': 'web-man',
            'x-branch-id': '10351767',
            'x-retailer-code': process.env.RETAILER || 'testfnbz27b',
            'x-retailer-id': '760874',
            'retailer': process.env.RETAILER || 'testfnbz27b'
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
     * Get recent invoices - simplified approach
     */
    private async getInvoiceList(): Promise<InvoiceListResponse> {
        // Simple approach: get recent invoices without complex filtering
        const url = `${this.baseUrl}/api/invoices?format=json&$top=50&$orderby=Id desc`;

        try {
            console.log(`🔍 Fetching recent invoices from: ${url}`);

            const response = await this.request.get(url, {
                headers: this.createHeaders(),
            });

            if (!response.ok()) {
                throw new Error(`API call failed with status: ${response.status()}`);
            }

            const data: any = await response.json();
            console.log(`📋 Found ${data.Data?.length || 0} recent invoices`);

            // Return the response as-is if it has Data property
            if (data.Data) {
                return data;
            } else if (Array.isArray(data)) {
                // Direct array
                return { Data: data, Message: 'Success' };
            } else {
                throw new Error('Unexpected response format');
            }

        } catch (error) {
            console.error(`❌ Failed to get invoice list:`, error);
            throw new Error(`Failed to get invoice list: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get specific invoice details by ID (using real API structure with Includes)
     */
    private async getInvoiceDetail(invoiceId: number): Promise<InvoiceDetailResponse> {
        // Add includes matching the real API call
        const includes = [
            'TotalQuantity',
            'TotalQuantityWoTopping',
            'Order',
            'User',
            'SoldBy',
            'Return',
            'Payments',
            'Customer',
            'PriceBook',
            'InvoicePromotions',
            'TableAndRoom',
            'Branch',
            'AddressLocation',
            'PartnerInvoiceFees'
        ];

        const params = new URLSearchParams();
        includes.forEach(include => {
            params.append('Includes', include);
        });

        const url = `${this.baseUrl}/api/invoices/${invoiceId}?${params.toString()}`;

        try {
            console.log(`🔍 Fetching invoice detail for ID: ${invoiceId}`);

            const response = await this.request.get(url, {
                headers: this.createHeaders(),
            });

            if (!response.ok()) {
                throw new Error(`API call failed with status: ${response.status()}`);
            }

            const data: any = await response.json();
            console.log(`🔍 Raw invoice detail response for ID ${invoiceId}:`, JSON.stringify(data, null, 2));

            this.validateApiResponse(data, 'Get invoice detail');

            // Handle different response structures
            if (data.Id) {
                // Direct invoice object (most common for detail API)
                console.log(`📋 Using direct invoice object structure`);
                return { Data: data, Message: 'Success' };
            } else if (data.Data) {
                // Wrapped in Data property
                console.log(`📋 Using wrapped Data structure`);
                return data;
            } else {
                throw new Error(`Unexpected invoice detail response format for ID: ${invoiceId}`);
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
     * Verify that an invoice exists for the given order code and product
     * @param orderCode - The order code to verify
     * @param productName - The specific product name to match
     * @param productId - Optional product ID for more precise matching
     */
    async verifyInvoice(orderCode: string, productName: string, productId?: number): Promise<void> {
        try {
            console.log(`🔍 Verifying invoice for order code: ${orderCode} with product: ${productName}`);

            // Step 1: Get the list of recent invoices
            const invoiceList = await this.getInvoiceList();

            if (!invoiceList.Data || invoiceList.Data.length === 0) {
                throw new Error('No invoices found in the system');
            }

            console.log(`📋 Found ${invoiceList.Data.length} recent invoices, looking for invoice with product: ${productName}`);

            // Step 2: Check recent invoices for the one containing our product
            let targetInvoice: any = null;
            let invoiceDetail: any = null;

            // Check the first 10 most recent invoices
            const recentInvoices = invoiceList.Data.slice(0, 10);

            for (const invoice of recentInvoices) {
                console.log(`🔍 Checking invoice ID: ${invoice.Id}, Code: ${invoice.Code}`);

                try {
                    const detail = await this.getInvoiceDetail(invoice.Id);

                    // Check if this invoice contains our product
                    const hasProduct = detail.Data.InvoiceDetails?.some((item: any) => {
                        const nameMatch = item.ProductName === productName;
                        const idMatch = productId ? item.ProductId === productId : true;

                        console.log(`   - Product: ${item.ProductName}, ID: ${item.ProductId}, Match: ${nameMatch && idMatch}`);
                        return nameMatch && idMatch;
                    });

                    if (hasProduct) {
                        targetInvoice = invoice;
                        invoiceDetail = detail;
                        console.log(`✅ Found matching invoice: ID=${invoice.Id}, Code=${invoice.Code}, contains product: ${productName}`);
                        break;
                    }
                } catch (error) {
                    console.log(`⚠️ Could not get details for invoice ID: ${invoice.Id}`);
                    continue;
                }
            }

            if (!targetInvoice || !invoiceDetail) {
                throw new Error(`Invoice containing product "${productName}" not found in recent invoices`);
            }

            // Step 4: Validate invoice detail structure
            if (!invoiceDetail || !invoiceDetail.Data) {
                throw new Error(`Invalid invoice detail response structure for ID: ${targetInvoice.Id}`);
            }

            // Step 5: Verify the invoice contains the expected product
            const productInInvoice = invoiceDetail.Data.InvoiceDetails?.find((item: any) => {
                return item.ProductName === productName && (productId ? item.ProductId === productId : true);
            });

            if (!productInInvoice) {
                throw new Error(`Invoice does not contain expected product: ${productName}`);
            }

            console.log(`🎉 Invoice verification successful:`);
            console.log(`   - Invoice Code: ${invoiceDetail.Data.Code || 'N/A'}`);
            console.log(`   - Invoice ID: ${invoiceDetail.Data.Id || 'N/A'}`);
            console.log(`   - Contains Product: ${productInInvoice.ProductName} (ID: ${productInInvoice.ProductId})`);
            console.log(`   - Product Quantity: ${productInInvoice.Quantity}`);
            console.log(`   - Product Total: ${productInInvoice.SubTotal}`);

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