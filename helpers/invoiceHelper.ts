import { APIRequestContext, expect } from "@playwright/test";

export class InvoiceHelper {
    constructor(
        private request: APIRequestContext,
        private token: string
    ) { }

    // Verify Invoice tạo thành công
    async verifyInvoice(orderCode: string, token: string) {
        const url1 = `https://fnb.kiotviet.vn/api/invoices?format=json`;
        const response1 = await this.request.get(url1, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const invoiceList = await response1.json();
        const invoiceId = invoiceList?.Data?.[0].Id;
        console.log("InvoiceId: ", invoiceId);
        const url2 = `https://fnb.kiotviet.vn/api/invoices/${invoiceId}`;
        const response2 = await this.request.get(url2, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const invoiceDetail = await response2.json();
        const invoiceOrderCode = invoiceDetail?.OrderCode;
        console.log("InvoiceOrderCode: ", invoiceOrderCode);
        expect(invoiceOrderCode).toBe(orderCode);
        console.log(`✅ Order ${invoiceDetail?.Code} verified with invoice successfully`);
    }
}