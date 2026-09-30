import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ArrowLeft, X } from 'lucide-react';
import { billingRuleApi, type BillingRule } from '../lib/billingRuleApi';
import { siteApi, type Site } from '../lib/siteApi';

const DAYS_OF_WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const PUBLIC_HOLIDAY_ACTIONS = [
  { value: 'no_change', label: '正常收费 (No Change)' },
  { value: 'extra_charge', label: '额外收费 (Extra Charge)' },
  { value: 'closed', label: '不营业/不收费 (Closed)' }
];

export default function BillingRules() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  
  const [site, setSite] = useState<Site | null>(null);
  const [rules, setRules] = useState<BillingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<BillingRule | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ 
    dayOfWeek: 1, 
    amountExGst: '', 
    publicHolidayAction: 'no_change',
    publicHolidayExtraExGst: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (siteId) {
      fetchData();
    }
  }, [siteId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!siteId) return;
      const [siteData, rulesData] = await Promise.all([
        siteApi.getSite(siteId),
        billingRuleApi.getBillingRulesBySite(siteId)
      ]);
      setSite(siteData);
      setRules(rulesData);
    } catch (err) {
      setError('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (rule?: BillingRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        dayOfWeek: rule.dayOfWeek,
        amountExGst: rule.amountExGst.toString(),
        publicHolidayAction: rule.publicHolidayAction,
        publicHolidayExtraExGst: rule.publicHolidayExtraExGst > 0 ? rule.publicHolidayExtraExGst.toString() : '',
        description: rule.description || ''
      });
    } else {
      setEditingRule(null);
      setFormData({ 
        dayOfWeek: 1, 
        amountExGst: '', 
        publicHolidayAction: 'no_change',
        publicHolidayExtraExGst: '',
        description: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId) return;
    
    const amount = parseFloat(formData.amountExGst);
    if (isNaN(amount) || amount < 0) {
      alert('请输入有效的正常收费金额');
      return;
    }

    let extraAmount = 0;
    if (formData.publicHolidayAction === 'extra_charge') {
      extraAmount = parseFloat(formData.publicHolidayExtraExGst);
      if (isNaN(extraAmount) || extraAmount < 0) {
        alert('请输入有效的公共假期额外收费金额');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        dayOfWeek: Number(formData.dayOfWeek),
        amountExGst: amount,
        publicHolidayAction: formData.publicHolidayAction,
        publicHolidayExtraExGst: extraAmount,
        description: formData.description
      };

      if (editingRule) {
        await billingRuleApi.updateBillingRule(editingRule.id, payload);
      } else {
        await billingRuleApi.createBillingRule(siteId, {
          siteId: siteId,
          ...payload
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

  const handleDelete = async (id: string, dayName: string) => {
    if (window.confirm(`确定要删除 ${dayName} 的计费规则吗？此操作不可恢复。`)) {
      try {
        await billingRuleApi.deleteBillingRule(id);
        await fetchData();
      } catch (err) {
        alert('删除失败');
      }
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto pb-20">
      {/* Header Area */}
      <div className="mb-6">
        <button 
          onClick={() => navigate(site?.clientId ? `/clients/${site.clientId}/sites` : '/clients')}
          className="flex items-center text-gray-500 hover:text-primary transition mb-4 text-sm font-medium"
        >
          <ArrowLeft size={16} className="mr-1" />
          返回站点列表
        </button>
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">计费规则</h1>
            <p className="text-sm text-gray-500 mt-1">
              当前站点: <span className="font-semibold text-primary">{site?.name || '加载中...'}</span>
            </p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-green-600 text-white p-2 rounded-full shadow hover:bg-green-700 transition"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">加载中...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : rules.length === 0 ? (
        <div className="text-center py-10 text-gray-500">尚未设置任何计费规则</div>
      ) : (
        <div className="space-y-4">
          {rules.map(rule => (
            <div key={rule.id} className="bg-white p-4 rounded-lg shadow border border-gray-100 relative">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-gray-900">
                  {DAYS_OF_WEEK[rule.dayOfWeek]}
                </h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleOpenModal(rule)}
                    className="p-1.5 text-gray-400 hover:text-primary transition"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(rule.id, DAYS_OF_WEEK[rule.dayOfWeek])}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 mt-3">
                <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-600">正常收费 (Ex GST)</span>
                  <span className="font-bold text-gray-900">${rule.amountExGst.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                  <span className="text-sm text-blue-700">公共假期</span>
                  <span className={`text-sm font-semibold ${rule.publicHolidayAction === 'closed' ? 'text-red-500' : rule.publicHolidayAction === 'extra_charge' ? 'text-green-600' : 'text-gray-600'}`}>
                    {rule.publicHolidayAction === 'closed' ? '不营业' : 
                     rule.publicHolidayAction === 'extra_charge' ? `额外 +$${rule.publicHolidayExtraExGst.toFixed(2)}` : '正常收费'}
                  </span>
                </div>
                
                {rule.description && (
                  <p className="text-xs text-gray-500 mt-2 px-1">备注: {rule.description}</p>
                )}
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
              <h2 className="text-lg font-semibold">{editingRule ? '编辑计费规则' : '新增计费规则'}</h2>
              <button onClick={handleCloseModal} className="text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">星期 *</label>
                <select 
                  value={formData.dayOfWeek}
                  onChange={e => setFormData({...formData, dayOfWeek: Number(e.target.value)})}
                  className="w-full border rounded-md p-2 focus:border-primary focus:outline-none"
                  disabled={!!editingRule}
                >
                  {DAYS_OF_WEEK.map((day, index) => (
                    <option key={index} value={index}>{day}</option>
                  ))}
                </select>
                {editingRule && <p className="text-xs text-gray-400 mt-1">编辑时无法更改星期，如需更改请删除后重建</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">金额 (Ex GST) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    required
                    value={formData.amountExGst}
                    onChange={e => setFormData({...formData, amountExGst: e.target.value})}
                    className="w-full pl-8 pr-4 py-2 border rounded-md focus:border-primary focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-2">
                <label className="block text-sm font-medium text-blue-700 mb-1">公共假期处理方式 *</label>
                <select 
                  value={formData.publicHolidayAction}
                  onChange={e => setFormData({...formData, publicHolidayAction: e.target.value})}
                  className="w-full border rounded-md p-2 focus:border-blue-500 focus:outline-none bg-blue-50"
                >
                  {PUBLIC_HOLIDAY_ACTIONS.map(action => (
                    <option key={action.value} value={action.value}>{action.label}</option>
                  ))}
                </select>
              </div>

              {formData.publicHolidayAction === 'extra_charge' && (
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                  <label className="block text-sm font-medium text-blue-800 mb-1">额外收费金额 (Ex GST) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      required={formData.publicHolidayAction === 'extra_charge'}
                      value={formData.publicHolidayExtraExGst}
                      onChange={e => setFormData({...formData, publicHolidayExtraExGst: e.target.value})}
                      className="w-full pl-8 pr-4 py-2 border rounded-md focus:border-blue-500 focus:outline-none"
                      placeholder="例如: 50.00"
                    />
                  </div>
                  <p className="text-xs text-blue-600 mt-1">此金额将在正常收费基础上叠加</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea 
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded-md p-2 focus:border-primary focus:outline-none"
                  placeholder="可选填备注信息"
                />
              </div>
              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-green-600 text-white py-2.5 rounded-md hover:bg-green-700 disabled:opacity-50 mt-2 font-medium"
              >
                {saving ? '保存中...' : '保存计费规则'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
