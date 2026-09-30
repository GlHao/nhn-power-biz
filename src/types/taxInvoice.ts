export interface BusinessEntityDto {
  id: string;
  name: string;
  address: string;
  abn: string;
  mobile: string;
  email: string;
  bsb: string;
  accountNumber: string;
}

export interface TaxInvoicePreviewRequestDto {
  clientId: string;
  periodStart: string;
  periodEnd: string;
}

export interface TaxInvoicePreviewItemDto {
  siteId: string;
  siteName: string;
  serviceDate: string;
  dayOfWeek: number;
  description?: string;
  baseAmountExGst: number;
  extraAmountExGst: number;
  finalAmountExGst: number;
  gstAmount: number;
  finalAmountIncGst: number;
  note?: string;
  status: string;
}

export interface TaxInvoicePreviewDto {
  clientId: string;
  clientName: string;
  clientAbn?: string;
  clientEmail?: string;
  periodStart: string;
  periodEnd: string;
  items: TaxInvoicePreviewItemDto[];
  subtotalExGst: number;
  gstAmount: number;
  totalIncGst: number;
}

export interface TaxInvoicePdfRequestDto {
  invoiceNo: string;
  issueDate: string;
  dueDate: string;
  preview: TaxInvoicePreviewDto;
  business: BusinessEntityDto;
  pdfType?: 'Full' | 'Simple' | 'DetailsOnly';
}
