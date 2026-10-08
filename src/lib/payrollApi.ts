import type {
  EmployeePayrollPreviewRequest,
  EmployeePayrollPreview,
  PaySlipPdfRequest,
  SendPaySlipEmailRequest,
  SendTransferSmsRequest
} from '../types/payroll';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const payrollApi = {
  async generatePreview(data: EmployeePayrollPreviewRequest): Promise<EmployeePayrollPreview> {
    const response = await fetch(`${API_BASE_URL}/payroll/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`Failed to generate payroll preview: ${errorMsg}`);
    }
    return await response.json();
  },

  async downloadPdf(data: PaySlipPdfRequest): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/payroll/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorMsg = await response.text();
      throw new Error(`Failed to generate Pay Slip PDF: ${errorMsg}`);
    }
    return await response.blob();
  },

  async sendEmail(data: SendPaySlipEmailRequest): Promise<{ success: boolean; message: string; r2Path?: string }> {
    const response = await fetch(`${API_BASE_URL}/payroll/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to send Pay Slip email');
    }
    return result;
  },

  async sendSms(data: SendTransferSmsRequest): Promise<{ success: boolean; message: string; phone?: string }> {
    const response = await fetch(`${API_BASE_URL}/payroll/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to send transfer SMS');
    }
    return result;
  }
};
