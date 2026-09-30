const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ScheduleRule {
  id: string;
  siteId: string;
  frequencyType: 'weekly' | 'fortnightly' | 'monthly';
  daysOfWeek?: number[];
  dayOfWeek?: number;
  startDate?: string;
  monthlyPattern?: 'first' | 'last';
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleRuleRequest {
  siteId: string;
  frequencyType: string;
  daysOfWeek?: number[];
  dayOfWeek?: number;
  startDate?: string;
  monthlyPattern?: string;
  description?: string;
}

export interface UpdateScheduleRuleRequest {
  frequencyType: string;
  daysOfWeek?: number[];
  dayOfWeek?: number;
  startDate?: string;
  monthlyPattern?: string;
  description?: string;
}

export const scheduleRuleApi = {
  async getScheduleRulesBySite(siteId: string): Promise<ScheduleRule[]> {
    const response = await fetch(`${API_BASE_URL}/sites/${siteId}/schedule-rules`);
    if (!response.ok) throw new Error('Failed to fetch schedule rules');
    return await response.json();
  },

  async getScheduleRule(id: string): Promise<ScheduleRule> {
    const response = await fetch(`${API_BASE_URL}/schedule-rules/${id}`);
    if (!response.ok) throw new Error('Failed to fetch schedule rule');
    return await response.json();
  },

  async createScheduleRule(siteId: string, data: CreateScheduleRuleRequest): Promise<ScheduleRule> {
    const response = await fetch(`${API_BASE_URL}/sites/${siteId}/schedule-rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create schedule rule');
    return await response.json();
  },

  async updateScheduleRule(id: string, data: UpdateScheduleRuleRequest): Promise<ScheduleRule> {
    const response = await fetch(`${API_BASE_URL}/schedule-rules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update schedule rule');
    return await response.json();
  },

  async deleteScheduleRule(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/schedule-rules/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete schedule rule');
  }
};
