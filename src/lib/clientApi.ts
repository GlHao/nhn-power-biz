const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface Client {
  id: string;
  name: string;
  abn?: string;
  email?: string;
  brandId?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  name: string;
  abn?: string;
  email?: string;
  notes?: string;
}

export interface UpdateClientRequest {
  name: string;
  abn?: string;
  email?: string;
  notes?: string;
}

export const clientApi = {
  async getClients(): Promise<Client[]> {
    const response = await fetch(`${API_BASE_URL}/clients`);
    if (!response.ok) throw new Error('Failed to fetch clients');
    return await response.json();
  },

  async getClient(id: string): Promise<Client> {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`);
    if (!response.ok) throw new Error('Failed to fetch client');
    return await response.json();
  },

  async createClient(data: CreateClientRequest): Promise<Client> {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create client');
    return await response.json();
  },

  async updateClient(id: string, data: UpdateClientRequest): Promise<Client> {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update client');
    return await response.json();
  },

  async deleteClient(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete client');
  }
};
