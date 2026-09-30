import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, X, ArrowLeft, MapPin, DollarSign, Calendar } from 'lucide-react';
import { siteApi, type Site } from '../lib/siteApi';
import { clientApi, type Client } from '../lib/clientApi';

export default function Sites() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  
  const [client, setClient] = useState<Client | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', address: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchData();
    }
  }, [clientId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!clientId) return;
      const [clientData, sitesData] = await Promise.all([
        clientApi.getClient(clientId),
        siteApi.getSitesByClient(clientId)
      ]);
      setClient(clientData);
      setSites(sitesData);
    } catch (err) {
      setError('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (site?: Site) => {
    if (site) {
      setEditingSite(site);
      setFormData({
        name: site.name,
        address: site.address || '',
        notes: site.notes || ''
      });
    } else {
      setEditingSite(null);
      setFormData({ name: '', address: '', notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSite(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !clientId) return;

    setSaving(true);
    try {
      if (editingSite) {
        await siteApi.updateSite(editingSite.id, formData);
      } else {
        await siteApi.createSite({
          clientId: clientId,
          ...formData
        });
      }
      await fetchData();
      handleCloseModal();
    } catch (err) {
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`确定要删除站点 "${name}" 吗？此操作不可恢复。`)) {
      try {
        await siteApi.deleteSite(id);
        await fetchData();
      } catch (err) {
        alert('删除失败');
      }
    }
  };

  const filteredSites = sites.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.address && s.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Header Area */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/clients')}
          className="flex items-center text-gray-500 hover:text-primary transition mb-4 text-sm font-medium"
        >
          <ArrowLeft size={16} className="mr-1" />
          返回客户列表
        </button>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">站点管理</h1>
            <p className="text-sm text-gray-500 mt-1">
              所属客户: <span className="font-semibold text-primary">{client?.name || '加载中...'}</span>
            </p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-primary text-white p-2 rounded-full shadow hover:bg-red-600 transition"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <input 
          type="text" 
          placeholder="搜索站点名称或地址..." 
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
      ) : filteredSites.length === 0 ? (
        <div className="text-center py-10 text-gray-500">没有找到站点</div>
      ) : (
        <div className="space-y-4">
          {filteredSites.map(site => (
            <div key={site.id} className="bg-white p-4 rounded-lg shadow border border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 flex items-center">
                  <MapPin size={16} className="text-primary mr-1" />
                  {site.name}
                </h3>
                {site.address && <p className="text-sm text-gray-500 mt-1">{site.address}</p>}
                {site.notes && <p className="text-sm text-gray-400 mt-1 text-xs">{site.notes}</p>}
                <div className="flex space-x-4 mt-3">
                  <Link 
                    to={`/sites/${site.id}/billing-rules`}
                    className="inline-flex items-center text-sm text-green-600 hover:text-green-700 transition font-medium"
                  >
                    <DollarSign size={16} className="mr-1" />
                    计费规则
                  </Link>
                  <Link 
                    to={`/sites/${site.id}/schedule-rules`}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition font-medium"
                  >
                    <Calendar size={16} className="mr-1" />
                    排期规则
                  </Link>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleOpenModal(site)}
                  className="p-2 text-gray-400 hover:text-primary transition"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(site.id, site.name)}
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
              <h2 className="text-lg font-semibold">{editingSite ? '编辑站点' : '新增站点'}</h2>
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
                  placeholder="例如: 悉尼分店"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full border rounded-md p-2 focus:border-primary focus:outline-none"
                  placeholder="详细地址"
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
