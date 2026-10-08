import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Edit2, Trash2, Search, X, Users, Building2, Phone, Mail, FileText, CheckCircle, XCircle } from 'lucide-react';
import { clientApi, type Client } from '../lib/clientApi';
import { employeeApi } from '../lib/employeeApi';
import type { Employee } from '../types/employee';

export default function Clients() {
  const [activeTab, setActiveTab] = useState<'clients' | 'employees'>('clients');

  // Client States
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientError, setClientError] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientFormData, setClientFormData] = useState({ name: '', abn: '', email: '', notes: '' });
  const [savingClient, setSavingClient] = useState(false);

  // Employee States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [employeeError, setEmployeeError] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeFormData, setEmployeeFormData] = useState({ name: '', phone: '', email: '', notes: '' });
  const [savingEmployee, setSavingEmployee] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchEmployees();
  }, []);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const data = await clientApi.getClients();
      setClients(data);
    } catch (err) {
      setClientError('加载客户列表失败');
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const data = await employeeApi.getEmployees();
      setEmployees(data);
    } catch (err) {
      setEmployeeError('加载雇员列表失败');
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Client Modal Handlers
  const handleOpenClientModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setClientFormData({
        name: client.name,
        abn: client.abn || '',
        email: client.email || '',
        notes: client.notes || ''
      });
    } else {
      setEditingClient(null);
      setClientFormData({ name: '', abn: '', email: '', notes: '' });
    }
    setIsClientModalOpen(true);
  };

  const handleCloseClientModal = () => {
    setIsClientModalOpen(false);
    setEditingClient(null);
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientFormData.name.trim()) return;

    setSavingClient(true);
    try {
      if (editingClient) {
        await clientApi.updateClient(editingClient.id, clientFormData);
      } else {
        await clientApi.createClient(clientFormData);
      }
      await fetchClients();
      handleCloseClientModal();
    } catch (err) {
      alert('保存失败，请重试');
    } finally {
      setSavingClient(false);
    }
  };

  const handleClientDelete = async (id: string, name: string) => {
    if (window.confirm(`确定要删除客户 "${name}" 吗？此操作不可恢复。`)) {
      try {
        await clientApi.deleteClient(id);
        await fetchClients();
      } catch (err) {
        alert('删除失败');
      }
    }
  };

  // Employee Modal Handlers
  const handleOpenEmployeeModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setEmployeeFormData({
        name: employee.name,
        phone: employee.phone || '',
        email: employee.email || '',
        notes: employee.notes || ''
      });
    } else {
      setEditingEmployee(null);
      setEmployeeFormData({ name: '', phone: '', email: '', notes: '' });
    }
    setIsEmployeeModalOpen(true);
  };

  const handleCloseEmployeeModal = () => {
    setIsEmployeeModalOpen(false);
    setEditingEmployee(null);
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeFormData.name.trim()) return;

    setSavingEmployee(true);
    try {
      if (editingEmployee) {
        await employeeApi.updateEmployee(editingEmployee.id, employeeFormData);
      } else {
        await employeeApi.createEmployee(employeeFormData);
      }
      await fetchEmployees();
      handleCloseEmployeeModal();
    } catch (err) {
      alert('保存雇员信息失败，请重试');
    } finally {
      setSavingEmployee(false);
    }
  };

  const handleEmployeeDelete = async (id: string, name: string) => {
    if (window.confirm(`确定要停用/删除雇员档案 "${name}" 吗？`)) {
      try {
        await employeeApi.deleteEmployee(id);
        await fetchEmployees();
      } catch (err) {
        alert('操作失败');
      }
    }
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    (c.abn && c.abn.includes(clientSearch))
  );

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    (e.phone && e.phone.includes(employeeSearch)) ||
    (e.email && e.email.toLowerCase().includes(employeeSearch.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="text-primary" size={28} />
            客户与团队管理
          </h1>
          <p className="text-xs text-gray-500 mt-1">管理商业客户、站点配置与清洁作业雇员团队</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'clients'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Building2 size={16} />
            客户与站点 ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'employees'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users size={16} />
            雇员团队 ({employees.length})
          </button>
        </div>
      </div>

      {/* TAB 1: CLIENTS & SITES */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="搜索客户名称或 ABN..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-gray-900 text-sm shadow-sm"
              />
              <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
            </div>
            <button
              onClick={() => handleOpenClientModal()}
              className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold shadow hover:bg-red-700 transition duration-200 text-sm"
            >
              <Plus size={18} />
              新增客户
            </button>
          </div>

          {loadingClients ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border">加载客户数据中...</div>
          ) : clientError ? (
            <div className="text-center py-16 text-red-500 bg-white rounded-2xl border">{clientError}</div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border">暂无客户记录</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-gray-900">{client.name}</h3>
                      <div className="flex space-x-1">
                        <button onClick={() => handleOpenClientModal(client)} className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-50">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleClientDelete(client.id, client.name)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {client.abn && <p className="text-xs text-gray-500 mt-1 font-mono">ABN: {client.abn}</p>}
                    {client.email && <p className="text-xs text-gray-500 mt-0.5">{client.email}</p>}
                    {client.notes && <p className="text-xs text-gray-400 mt-2 bg-gray-50 p-2 rounded-lg italic">{client.notes}</p>}
                  </div>

                  <Link
                    to={`/clients/${client.id}/sites`}
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-red-50 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition duration-200"
                  >
                    <MapPin size={14} />
                    管理站点及计费规则
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EMPLOYEES */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="搜索雇员姓名、电话或邮箱..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-gray-900 text-sm shadow-sm"
              />
              <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
            </div>
            <button
              onClick={() => handleOpenEmployeeModal()}
              className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold shadow hover:bg-red-700 transition duration-200 text-sm"
            >
              <Plus size={18} />
              新增雇员档案
            </button>
          </div>

          {loadingEmployees ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border">加载雇员团队数据中...</div>
          ) : employeeError ? (
            <div className="text-center py-16 text-red-500 bg-white rounded-2xl border">{employeeError}</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border">暂无雇员记录</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => (
                <div key={emp.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-100 to-amber-100 text-primary font-bold flex items-center justify-center text-sm shadow-inner">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-gray-900">{emp.name}</h3>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${emp.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-gray-100 text-gray-500'}`}>
                            {emp.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                            {emp.isActive ? '在职 / 活跃' : '已停用'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button onClick={() => handleOpenEmployeeModal(emp)} className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-50">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleEmployeeDelete(emp.id, emp.name)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-gray-50 text-xs text-gray-600">
                      {emp.phone ? (
                        <p className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-400" />
                          <span>{emp.phone}</span>
                        </p>
                      ) : (
                        <p className="flex items-center gap-2 text-gray-400 italic">
                          <Phone size={14} /> 未录入电话
                        </p>
                      )}
                      {emp.email ? (
                        <p className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400" />
                          <span>{emp.email}</span>
                        </p>
                      ) : (
                        <p className="flex items-center gap-2 text-gray-400 italic">
                          <Mail size={14} /> 未录入 Email
                        </p>
                      )}
                      {emp.notes && (
                        <p className="flex items-start gap-2 bg-gray-50 p-2 rounded-lg text-gray-500 mt-2">
                          <FileText size={14} className="text-gray-400 shrink-0 mt-0.5" />
                          <span>{emp.notes}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CLIENT MODAL */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden text-gray-900 shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold">{editingClient ? '编辑客户档案' : '新增商业客户'}</h2>
              <button onClick={handleCloseClientModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleClientSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">客户名称 *</label>
                <input
                  type="text"
                  required
                  value={clientFormData.name}
                  onChange={e => setClientFormData({...clientFormData, name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none text-sm"
                  placeholder="例如: ABC Corporation"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">ABN</label>
                <input
                  type="text"
                  value={clientFormData.abn}
                  onChange={e => setClientFormData({...clientFormData, abn: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none text-sm font-mono"
                  placeholder="例如: 12 345 678 901"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">联系 Email</label>
                <input
                  type="email"
                  value={clientFormData.email}
                  onChange={e => setClientFormData({...clientFormData, email: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none text-sm"
                  placeholder="accounts@client.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">备注说明</label>
                <textarea
                  rows={3}
                  value={clientFormData.notes}
                  onChange={e => setClientFormData({...clientFormData, notes: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none text-sm"
                  placeholder="付款周期或特别注意事项..."
                />
              </div>
              <button
                type="submit"
                disabled={savingClient}
                className="w-full bg-primary text-white py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 font-bold text-sm shadow-md transition"
              >
                {savingClient ? '正在保存...' : '保存客户档案'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EMPLOYEE MODAL */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden text-gray-900 shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold">{editingEmployee ? '编辑雇员档案' : '新增雇员档案'}</h2>
              <button onClick={handleCloseEmployeeModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleEmployeeSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">雇员姓名 *</label>
                <input
                  type="text"
                  required
                  value={employeeFormData.name}
                  onChange={e => setEmployeeFormData({...employeeFormData, name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none text-sm"
                  placeholder="例如: 张三 (John Doe)"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">手机号码 (接收短信通知)</label>
                <input
                  type="text"
                  value={employeeFormData.phone}
                  onChange={e => setEmployeeFormData({...employeeFormData, phone: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none text-sm font-mono"
                  placeholder="例如: 0412345678"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email 地址 (接收 Pay Slip PDF)</label>
                <input
                  type="email"
                  value={employeeFormData.email}
                  onChange={e => setEmployeeFormData({...employeeFormData, email: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none text-sm"
                  placeholder="john.doe@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">备注说明</label>
                <textarea
                  rows={3}
                  value={employeeFormData.notes}
                  onChange={e => setEmployeeFormData({...employeeFormData, notes: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none text-sm"
                  placeholder="开户行信息、ABN 或其它说明..."
                />
              </div>
              <button
                type="submit"
                disabled={savingEmployee}
                className="w-full bg-primary text-white py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 font-bold text-sm shadow-md transition"
              >
                {savingEmployee ? '正在保存...' : '保存雇员档案'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
