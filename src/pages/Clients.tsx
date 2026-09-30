import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { clientApi, type Client } from '../lib/clientApi';

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', abn: '', email: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await clientApi.getClients();
      setClients(data);
    } catch (err) {
      setError('加载客户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        abn: client.abn || '',
        email: client.email || '',
        notes: client.notes || ''
      });
    } else {
      setEditingClient(null);
      setFormData({ name: '', abn: '', email: '', notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      if (editingClient) {
        await clientApi.updateClient(editingClient.id, formData);
      } else {
        await clientApi.createClient(formData);
      }
      await fetchClients();
      handleCloseModal();
    } catch (err) {
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`确定要删除客户 "${name}" 吗？此操作不可恢复。`)) {
      try {
        await clientApi.deleteClient(id);
        await fetchClients();
      } catch (err) {
        alert('删除失败');
      }
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.abn && c.abn.includes(search))
  );

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">客户管理</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary text-white p-2 rounded-full shadow hover:bg-red-600 transition"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="relative mb-6">
        <input 
          type="text" 
          placeholder="搜索客户名称或 ABN..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-primary text-gray-900 bg-white"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">加载中...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-10 text-gray-500">没有找到客户</div>
      ) : (
        <div className="space-y-4">
          {filteredClients.map(client => (
            <div key={client.id} className="bg-white p-4 rounded-lg shadow border border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{client.name}</h3>
                {client.abn && <p className="text-sm text-gray-500 mt-1">ABN: {client.abn}</p>}
                {client.email && <p className="text-sm text-gray-500">Email: {client.email}</p>}
                <Link 
                  to={`/clients/${client.id}/sites`}
                  className="inline-flex items-center mt-3 text-sm text-primary hover:text-red-700 transition font-medium"
                >
                  <MapPin size={16} className="mr-1" />
                  管理站点
                </Link>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleOpenModal(client)}
                  className="p-2 text-gray-400 hover:text-primary transition"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(client.id, client.name)}
                  className="p-2 text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden text-gray-900">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">{editingClient ? '编辑客户' : '新增客户'}</h2>
              <button onClick={handleCloseModal} className="text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名称 *</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded-md p-2 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ABN</label>
                <input 
                  type="text" 
                  value={formData.abn}
                  onChange={e => setFormData({...formData, abn: e.target.value})}
                  className="w-full border rounded-md p-2 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full border rounded-md p-2 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea 
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full border rounded-md p-2 focus:border-primary focus:outline-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-primary text-white py-2 rounded-md hover:bg-red-600 disabled:opacity-50 font-medium"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
