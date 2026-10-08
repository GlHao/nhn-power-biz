export interface Employee {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeRequest {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface UpdateEmployeeRequest {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  isActive?: boolean;
}
