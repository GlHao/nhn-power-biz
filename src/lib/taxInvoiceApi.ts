import type { TaxInvoicePreviewRequestDto, TaxInvoicePreviewDto, BusinessEntityDto, TaxInvoicePdfRequestDto } from '../types/taxInvoice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const taxInvoiceApi = {
  async getBusinesses(): Promise<BusinessEntityDto[]> {
    const response = await fetch(`${API_BASE_URL}/tax-invoices/businesses`);
    if (!response.ok) {
      throw new Error('Failed to fetch businesses');
    }
    return await response.json();
  },

  async generatePreview(data: TaxInvoicePreviewRequestDto): Promise<TaxInvoicePreviewDto> {
    const response = await fetch(`${API_BASE_URL}/tax-invoices/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(`Failed to generate preview: ${errorMsg}`);
    }
    
    return await response.json();
  },

  async downloadPdf(data: TaxInvoicePdfRequestDto): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/tax-invoices/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(`Failed to generate PDF: ${errorMsg}`);
    }
    
    return await response.blob();
  },

  async sendEmail(data: { pdfRequest: TaxInvoicePdfRequestDto; targetEmails?: string }): Promise<{ success: boolean; message: string; r2Path?: string }> {
    const response = await fetch(`${API_BASE_URL}/tax-invoices/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to send email');
    }

    return result;
  }
};
