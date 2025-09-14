import { APIRequestContext, expect } from "@playwright/test";

export class InvoiceHelper {
    constructor(
        private request: APIRequestContext,
        private token: string
    ) { }

    // async waitForInvoice(token: string, maxRetries = 10, intervalMs = 1000) {
    //     const url = `https://fnb.kiotviet.vn/api/invoices?format=json`;
    //     let data: any[] = [];

    //     for (let i = 0; i < maxRetries; i++) {
    //         const response = await this.request.get(url, {
    //             headers: { Authorization: `Bearer ${token}` },
    //         });
    //         data = await response.json();
    //         if (data && data.length > 0) {
    //             return data; // trả về dữ liệu khi đã có invoice
    //         }
    //         await new Promise(res => setTimeout(res, intervalMs)); // đợi interval trước khi thử lại
    //     }
    // };


    async verifyInvoice(orderCode: string, token: string) {
        const url1 = `https://fnb.kiotviet.vn/api/invoices?format=json`;

        const response1 = await this.request.get(url1, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const invoiceList = await response1.json();
        const invoiceId = invoiceList?.Data?.[0].Id;

        const url2 = `https://fnb.kiotviet.vn/api/invoices/${invoiceId}`;

        const response2 = await this.request.get(url2, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const invoiceDetail = await response2.json();
        const invoiceOrderCode = invoiceDetail?.OrderCode;
        expect(invoiceOrderCode).toBe(orderCode);

        console.log(`✅ Order ${orderCode} verified with invoice successfully`);
    }
}