const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface BillingRule {
  id: string;
  siteId: string;
  dayOfWeek: number;
  amountExGst: number;
  publicHolidayAction: string;
  publicHolidayExtraExGst: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBillingRuleRequest {
  siteId: string;
  dayOfWeek: number;
  amountExGst: number;
  publicHolidayAction: string;
  publicHolidayExtraExGst: number;
  description?: string;
}

export interface UpdateBillingRuleRequest {
  dayOfWeek: number;
  amountExGst: number;
  publicHolidayAction: string;
  publicHolidayExtraExGst: number;
  description?: string;
}

export const billingRuleApi = {
  async getBillingRulesBySite(siteId: string): Promise<BillingRule[]> {
    const response = await fetch(`${API_BASE_URL}/sites/${siteId}/billing-rules`);
    if (!response.ok) throw new Error('Failed to fetch billing rules');
    return await response.json();
  },

  async getBillingRule(id: string): Promise<BillingRule> {
    const response = await fetch(`${API_BASE_URL}/billing-rules/${id}`);
    if (!response.ok) throw new Error('Failed to fetch billing rule');
    return await response.json();
  },

  async createBillingRule(siteId: string, data: CreateBillingRuleRequest): Promise<BillingRule> {
    const response = await fetch(`${API_BASE_URL}/sites/${siteId}/billing-rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create billing rule');
    return await response.json();
  },

  async updateBillingRule(id: string, data: UpdateBillingRuleRequest): Promise<BillingRule> {
    const response = await fetch(`${API_BASE_URL}/billing-rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update billing rule');
    return await response.json();
  },

  async deleteBillingRule(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/billing-rules/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete billing rule');
  }
};
