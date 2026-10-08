import { BusinessEntityDto } from './taxInvoice';

export interface EmployeePayrollPreviewRequest {
  employeeId: string;
  periodStart: string;
  periodEnd: string;
}

export interface EmployeePayrollPreviewItem {
  siteId: string;
  siteName: string;
  serviceDate: string;
  dayOfWeek: number;
  description?: string;
  payExGst: number;
  note?: string;
}

export interface EmployeePayrollPreview {
  employeeId: string;
  employeeName: string;
  employeePhone?: string;
  employeeEmail?: string;
  periodStart: string;
  periodEnd: string;
  items: EmployeePayrollPreviewItem[];
  totalServices: number;
  totalPayExGst: number;
}

export interface PaySlipPdfRequest {
  paySlipNo: string;
  issueDate: string;
  preview: EmployeePayrollPreview;
  business: BusinessEntityDto;
}

export interface SendPaySlipEmailRequest {
  pdfRequest: PaySlipPdfRequest;
  targetEmails?: string;
}

export interface SendTransferSmsRequest {
  employeeId: string;
  amount: number;
  periodDescription: string;
  customPhone?: string;
}
