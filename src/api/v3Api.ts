import { apiClient } from './client';

// DTO Interfaces
export interface ReceiptItem {
  id: string;
  merchantName?: string;
  transactionDate?: string;
  totalAmount: number;
  gstAmount: number;
  r2Key: string;
  r2Url?: string;
  status: 'pending' | 'matched';
  matchedTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerQuarterSummary {
  id: string;
  yearQuarter: string;
  status: 'draft' | 'completed';
  totalTransactions: number;
  totalAmount: number;
  totalGst: number;
  uncategorizedCount: number;
  ruleMatchedCount: number;
  receiptMatchedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerTransaction {
  id: string;
  quarterId: string;
  yearQuarter: string;
  transactionDate: string;
  amount: number;
  gstAmount: number;
  bankDescription: string;
  balance?: number;
  notes?: string;
  status: 'uncategorized' | 'rule_matched' | 'receipt_matched' | 'completed';
  matchedReceiptId?: string;
  matchedReceiptMerchant?: string;
  matchedReceiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerRule {
  id: string;
  keyword: string;
  categoryNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoItem {
  id: string;
  groupId: string;
  title: string;
  notes?: string;
  dueDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoGroup {
  id: string;
  name: string;
  sortOrder: number;
  completedCount: number;
  totalCount: number;
  createdAt: string;
  updatedAt: string;
  items: TodoItem[];
}

// Receipts API
export const receiptsApi = {
  upload: async (base64Data: string, fileName: string, contentType: string) => {
    const res = await apiClient.post('/receipts/upload', { base64Data, fileName, contentType });
    return res.data;
  },
  getAll: async (status?: string) => {
    const res = await apiClient.get('/receipts', { params: { status } });
    return res.data;
  },
  update: async (id: string, dto: Partial<ReceiptItem>) => {
    const res = await apiClient.put(`/receipts/${id}`, dto);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/receipts/${id}`);
    return res.data;
  },
};

// Ledger API
export const ledgerApi = {
  getQuarters: async () => {
    const res = await apiClient.get('/ledger/quarters');
    return res.data;
  },
  getQuarterTransactions: async (quarterId: string) => {
    const res = await apiClient.get(`/ledger/quarters/${quarterId}`);
    return res.data;
  },
  importHistoryExcel: async (base64Data: string, fileName: string) => {
    const res = await apiClient.post('/ledger/import-history', { base64Data, fileName });
    return res.data;
  },
  importBankCsv: async (base64Data: string, fileName: string) => {
    const res = await apiClient.post('/ledger/import-csv', { base64Data, fileName });
    return res.data;
  },
  autoMatchReceipts: async (quarterId: string) => {
    const res = await apiClient.post(`/ledger/quarters/${quarterId}/auto-match`);
    return res.data;
  },
  updateTransaction: async (id: string, dto: { notes?: string; gstAmount?: number; status?: string }) => {
    const res = await apiClient.put(`/ledger/transactions/${id}`, dto);
    return res.data;
  },
  finalizeQuarter: async (quarterId: string) => {
    const res = await apiClient.post(`/ledger/quarters/${quarterId}/finalize`);
    return res.data;
  },
  exportQuarterExcel: async (quarterId: string) => {
    const res = await apiClient.get(`/ledger/quarters/${quarterId}/export`, { responseType: 'blob' });
    return res.data;
  },
  getRules: async () => {
    const res = await apiClient.get('/ledger/rules');
    return res.data;
  },
  createOrUpdateRule: async (dto: { keyword: string; categoryNote: string }) => {
    const res = await apiClient.post('/ledger/rules', dto);
    return res.data;
  },
  deleteRule: async (id: string) => {
    const res = await apiClient.delete(`/ledger/rules/${id}`);
    return res.data;
  },
};

// TodoList API
export const todoApi = {
  getGroups: async () => {
    const res = await apiClient.get('/todo/groups');
    return res.data;
  },
  createGroup: async (dto: { name: string; sortOrder?: number }) => {
    const res = await apiClient.post('/todo/groups', dto);
    return res.data;
  },
  updateGroup: async (id: string, dto: { name?: string; sortOrder?: number }) => {
    const res = await apiClient.put(`/todo/groups/${id}`, dto);
    return res.data;
  },
  deleteGroup: async (id: string) => {
    const res = await apiClient.delete(`/todo/groups/${id}`);
    return res.data;
  },
  createItem: async (dto: { groupId: string; title: string; notes?: string; dueDate?: string }) => {
    const res = await apiClient.post('/todo/items', dto);
    return res.data;
  },
  updateItem: async (id: string, dto: { title?: string; notes?: string; dueDate?: string; isCompleted?: boolean }) => {
    const res = await apiClient.put(`/todo/items/${id}`, dto);
    return res.data;
  },
  toggleItem: async (id: string) => {
    const res = await apiClient.post(`/todo/items/${id}/toggle`);
    return res.data;
  },
  deleteItem: async (id: string) => {
    const res = await apiClient.delete(`/todo/items/${id}`);
    return res.data;
  },
};
