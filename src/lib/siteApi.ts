const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface Site {
  id: string;
  clientId: string;
  name: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSiteRequest {
  clientId: string;
  name: string;
  address?: string;
  notes?: string;
}

export interface UpdateSiteRequest {
  name: string;
  address?: string;
  notes?: string;
}

export const siteApi = {
  async getSitesByClient(clientId: string): Promise<Site[]> {
    const response = await fetch(`${API_BASE_URL}/clients/${clientId}/sites`);
    if (!response.ok) throw new Error('Failed to fetch sites');
    return await response.json();
  },

  async getSite(id: string): Promise<Site> {
    const response = await fetch(`${API_BASE_URL}/sites/${id}`);
    if (!response.ok) throw new Error('Failed to fetch site');
    return await response.json();
  },

  async createSite(data: CreateSiteRequest): Promise<Site> {
    const response = await fetch(`${API_BASE_URL}/sites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create site');
    return await response.json();
  },

  async updateSite(id: string, data: UpdateSiteRequest): Promise<Site> {
    const response = await fetch(`${API_BASE_URL}/sites/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update site');
    return await response.json();
  },

  async deleteSite(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/sites/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete site');
  }
};
