import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ArrowLeft, X } from 'lucide-react';
import { scheduleRuleApi, type ScheduleRule } from '../lib/scheduleRuleApi';
import { siteApi, type Site } from '../lib/siteApi';

const DAYS_OF_WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const FREQUENCY_TYPES = [
  { value: 'weekly', label: '每周 (Weekly)' },
  { value: 'fortnightly', label: '每两周 (Fortnightly)' },
  { value: 'monthly', label: '每月 (Monthly)' }
];
const MONTHLY_PATTERNS = [
  { value: 'first', label: '第一个 (First)' },
  { value: 'last', label: '最后一个 (Last)' }
];

export default function ScheduleRules() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  
  const [site, setSite] = useState<Site | null>(null);
  const [rules, setRules] = useState<ScheduleRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ScheduleRule | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ 
    frequencyType: 'weekly',
    daysOfWeek: [] as number[],
    dayOfWeek: 1,
    startDate: new Date().toISOString().split('T')[0],
    monthlyPattern: 'first',
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
        scheduleRuleApi.getScheduleRulesBySite(siteId)
      ]);
      setSite(siteData);
      setRules(rulesData);
    } catch (err) {
      setError('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (rule?: ScheduleRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        frequencyType: rule.frequencyType,
        daysOfWeek: rule.daysOfWeek || [],
        dayOfWeek: rule.dayOfWeek ?? 1,
        startDate: rule.startDate ? rule.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        monthlyPattern: rule.monthlyPattern || 'first',
        description: rule.description || ''
      });
    } else {
      setEditingRule(null);
      setFormData({ 
        frequencyType: 'weekly',
        daysOfWeek: [],
        dayOfWeek: 1,
        startDate: new Date().toISOString().split('T')[0],
        monthlyPattern: 'first',
        description: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
  };

  const handleDayOfWeekToggle = (day: number) => {
    setFormData(prev => {
      const current = prev.daysOfWeek;
      if (current.includes(day)) {
        return { ...prev, daysOfWeek: current.filter(d => d !== day) };
      } else {
        return { ...prev, daysOfWeek: [...current, day].sort() };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId) return;
    
    if (formData.frequencyType === 'weekly' && formData.daysOfWeek.length === 0) {
      alert('请至少选择一个星期');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        frequencyType: formData.frequencyType,
        description: formData.description
      };

      if (formData.frequencyType === 'weekly') {
        payload.daysOfWeek = formData.daysOfWeek;
      } else if (formData.frequencyType === 'fortnightly') {
        payload.dayOfWeek = Number(formData.dayOfWeek);
        payload.startDate = new Date(formData.startDate).toISOString();
      } else if (formData.frequencyType === 'monthly') {
        payload.dayOfWeek = Number(formData.dayOfWeek);
        payload.monthlyPattern = formData.monthlyPattern;
      }

      if (editingRule) {
        await scheduleRuleApi.updateScheduleRule(editingRule.id, payload);
      } else {
        await scheduleRuleApi.createScheduleRule(siteId, {
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

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除此排期规则吗？')) {
      try {
        await scheduleRuleApi.deleteScheduleRule(id);
        await fetchData();
      } catch (err) {
        alert('删除失败');
      }
    }
  };

  const formatRuleText = (rule: ScheduleRule) => {
    if (rule.frequencyType === 'weekly') {
      const days = rule.daysOfWeek?.map(d => DAYS_OF_WEEK[d]).join('、');
      return `每周 - ${days}`;
    } else if (rule.frequencyType === 'fortnightly') {
      const start = rule.startDate ? new Date(rule.startDate).toLocaleDateString() : '';
      return `每两周 - ${rule.dayOfWeek !== undefined ? DAYS_OF_WEEK[rule.dayOfWeek] : ''} (起于 ${start})`;
    } else if (rule.frequencyType === 'monthly') {
      const pattern = rule.monthlyPattern === 'first' ? '第一个' : '最后一个';
      return `每月 - ${pattern} ${rule.dayOfWeek !== undefined ? DAYS_OF_WEEK[rule.dayOfWeek] : ''}`;
    }
    return '未知规则';
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
            <h1 className="text-2xl font-bold text-gray-900">排期规则</h1>
            <p className="text-sm text-gray-500 mt-1">
              当前站点: <span className="font-semibold text-primary">{site?.name || '加载中...'}</span>
            </p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white p-2 rounded-full shadow hover:bg-blue-700 transition"
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
        <div className="text-center py-10 text-gray-500">尚未设置任何排期规则</div>
      ) : (
        <div className="space-y-4">
          {rules.map(rule => (
            <div key={rule.id} className="bg-white p-4 rounded-lg shadow border border-gray-100 relative">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-gray-900">
                  {formatRuleText(rule)}
                </h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleOpenModal(rule)}
                    className="p-1.5 text-gray-400 hover:text-primary transition"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(rule.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {rule.description && (
                <p className="text-sm text-gray-500 mt-2 px-1">备注: {rule.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden text-gray-900">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">{editingRule ? '编辑排期规则' : '新增排期规则'}</h2>
              <button onClick={handleCloseModal} className="text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">频次 *</label>
                <select 
                  value={formData.frequencyType}
                  onChange={e => setFormData({...formData, frequencyType: e.target.value})}
                  className="w-full border rounded-md p-2 focus:border-blue-500 focus:outline-none"
                >
                  {FREQUENCY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {formData.frequencyType === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择星期 (可多选) *</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day, index) => {
                      const isSelected = formData.daysOfWeek.includes(index);
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleDayOfWeekToggle(index)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                            isSelected 
                              ? 'bg-blue-600 text-white shadow' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {formData.frequencyType === 'fortnightly' && (
                <div className="space-y-4 bg-gray-50 p-3 rounded border border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">选择星期 *</label>
                    <select 
                      value={formData.dayOfWeek}
                      onChange={e => setFormData({...formData, dayOfWeek: Number(e.target.value)})}
                      className="w-full border rounded-md p-2 focus:border-blue-500 focus:outline-none"
                    >
                      {DAYS_OF_WEEK.map((day, index) => (
                        <option key={index} value={index}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">起始日期 (用于计算单双周) *</label>
                    <input 
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                      className="w-full border rounded-md p-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {formData.frequencyType === 'monthly' && (
                <div className="space-y-4 bg-gray-50 p-3 rounded border border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">发生于每月的 *</label>
                    <select 
                      value={formData.monthlyPattern}
                      onChange={e => setFormData({...formData, monthlyPattern: e.target.value})}
                      className="w-full border rounded-md p-2 focus:border-blue-500 focus:outline-none"
                    >
                      {MONTHLY_PATTERNS.map(pattern => (
                        <option key={pattern.value} value={pattern.value}>{pattern.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">选择星期 *</label>
                    <select 
                      value={formData.dayOfWeek}
                      onChange={e => setFormData({...formData, dayOfWeek: Number(e.target.value)})}
                      className="w-full border rounded-md p-2 focus:border-blue-500 focus:outline-none"
                    >
                      {DAYS_OF_WEEK.map((day, index) => (
                        <option key={index} value={index}>{day}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea 
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded-md p-2 focus:border-blue-500 focus:outline-none"
                  placeholder="可选填备注信息"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-50 mt-2 font-medium"
              >
                {saving ? '保存中...' : '保存排期规则'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
