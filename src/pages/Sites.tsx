import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Plus, Edit2, Trash2, Search, X, ArrowLeft, DollarSign, Calendar, Tag } from 'lucide-react';
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
  const [formData, setFormData] = useState({ name: '', alias: '', address: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchData();
    }
  }, [clientId]);

  const fetchData = async () => {
    if (!clientId) return;
    try {
      setLoading(true);
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
        alias: site.alias || '',
        address: site.address || '',
        notes: site.notes || ''
      });
    } else {
      setEditingSite(null);
      setFormData({ name: '', alias: '', address: '', notes: '' });
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
    (s.alias && s.alias.toLowerCase().includes(search.toLowerCase())) ||
    (s.address && s.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      {/* Header Area */}
      <div>
        <button
          onClick={() => navigate('/clients')}
          className="flex items-center text-gray-500 hover:text-primary transition mb-4 text-sm font-medium"
        >
          <ArrowLeft size={16} className="mr-1" />
          返回客户与团队列表
        </button>

        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">站点管理</h1>
            <p className="text-sm text-gray-500 mt-1">
              所属客户: <span className="font-semibold text-primary">{client?.name || '加载中...'}</span>
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary text-white p-2.5 rounded-full shadow hover:bg-red-600 transition"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="搜索站点名称、别名或地址..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:border-primary text-gray-900 bg-white text-sm shadow-sm"
        />
        <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 bg-white rounded-xl border">加载数据中...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500 bg-white rounded-xl border">{error}</div>
      ) : filteredSites.length === 0 ? (
        <div className="text-center py-10 text-gray-400 bg-white rounded-xl border">没有找到站点</div>
      ) : (
        <div className="space-y-4">
          {filteredSites.map(site => (
            <div key={site.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start space-x-3">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-lg text-gray-900 flex items-center">
                    <MapPin size={18} className="text-primary mr-1.5 shrink-0" />
                    {site.name}
                  </h3>
                  {site.alias && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      <Tag size={12} className="text-amber-600" />
                      {site.alias}
                    </span>
                  )}
                </div>

                {site.address && <p className="text-xs text-gray-500 mt-1.5">{site.address}</p>}
                {site.notes && <p className="text-xs text-gray-400 mt-1 bg-gray-50 p-2 rounded-lg italic">{site.notes}</p>}

                <div className="flex space-x-4 mt-3 pt-2 border-t border-gray-50">
                  <Link
                    to={`/sites/${site.id}/billing-rules`}
                    className="inline-flex items-center text-xs text-emerald-600 hover:text-emerald-700 transition font-bold"
                  >
                    <DollarSign size={14} className="mr-1" />
                    计费与工资规则
                  </Link>
                  <Link
                    to={`/sites/${site.id}/schedule-rules`}
                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 transition font-bold"
                  >
                    <Calendar size={14} className="mr-1" />
                    排期规则
                  </Link>
                </div>
              </div>

              <div className="flex space-x-1 shrink-0">
                <button
                  onClick={() => handleOpenModal(site)}
                  className="p-1.5 text-gray-400 hover:text-primary transition rounded-lg hover:bg-gray-50"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(site.id, site.name)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-gray-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden text-gray-900 shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold">{editingSite ? '编辑站点档案' : '新增站点档案'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">官方站点名称 *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none text-sm"
                  placeholder="例如: Chemist Warehouse Parramatta"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Tag size={13} className="text-amber-600" />
                  站点别名 / Cleaner 常用俗称
                </label>
                <input
                  type="text"
                  value={formData.alias}
                  onChange={e => setFormData({...formData, alias: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none text-sm bg-amber-50/30"
                  placeholder="例如: 药房 / P店 (方便 Cleaner 员工识别)"
                />
                <p className="text-[11px] text-gray-400 mt-1">设置后，雇员工资单 Pay Slip 将自动附带显示此别名。</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">站点详细地址</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none text-sm"
                  placeholder="Street Address, Suburb..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">备注说明</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none text-sm"
                  placeholder="进出锁码、警报代码或其它操作说明..."
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-white py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 font-bold text-sm shadow-md transition"
              >
                {saving ? '正在保存...' : '保存站点档案'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
