import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, X, User } from 'lucide-react';
import { siteApi, type Site } from '../lib/siteApi';
import { billingRuleApi, type BillingRule } from '../lib/billingRuleApi';
import { employeeApi } from '../lib/employeeApi';
import type { Employee } from '../types/employee';

const DAYS_OF_WEEK = ['周日 (Sunday)', '周一 (Monday)', '周二 (Tuesday)', '周三 (Wednesday)', '周四 (Thursday)', '周五 (Friday)', '周六 (Saturday)'];

const PUBLIC_HOLIDAY_ACTIONS = [
  { value: 'none', label: '正常收费 (无变化)' },
  { value: 'closed', label: '不营业 (不收费)' },
  { value: 'extra_charge', label: '加收公共假期服务费' }
];

export default function BillingRules() {
  const { siteId } = useParams<{ siteId: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [rules, setRules] = useState<BillingRule[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<BillingRule | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    amountExGst: '',
    publicHolidayAction: 'none',
    publicHolidayExtraExGst: '',
    description: '',
    employeeId: '',
    employeePayExGst: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (siteId) {
      fetchSiteAndRules();
      fetchEmployees();
    }
  }, [siteId]);

  const fetchSiteAndRules = async () => {
    try {
      setLoading(true);
      const [siteData, rulesData] = await Promise.all([
        siteApi.getSite(siteId!),
        billingRuleApi.getBillingRulesBySite(siteId!)
      ]);
      setSite(siteData);
      setRules(rulesData);
    } catch (err) {
      setError('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const empData = await employeeApi.getEmployees();
      setEmployees(empData.filter(e => e.isActive));
    } catch (err) {
      console.error('Failed to load employees', err);
    }
  };

  const handleOpenModal = (rule?: BillingRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        dayOfWeek: rule.dayOfWeek,
        amountExGst: rule.amountExGst.toString(),
        publicHolidayAction: rule.publicHolidayAction || 'none',
        publicHolidayExtraExGst: (rule.publicHolidayExtraExGst || 0).toString(),
        description: rule.description || '',
        employeeId: rule.employeeId || '',
        employeePayExGst: (rule.employeePayExGst || 0).toString()
      });
    } else {
      setEditingRule(null);
      setFormData({
        dayOfWeek: 1,
        amountExGst: '',
        publicHolidayAction: 'none',
        publicHolidayExtraExGst: '',
        description: '',
        employeeId: '',
        employeePayExGst: ''
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
    if (!formData.amountExGst) return;

    setSaving(true);
    try {
      const payload = {
        siteId: siteId!,
        dayOfWeek: Number(formData.dayOfWeek),
        amountExGst: parseFloat(formData.amountExGst),
        publicHolidayAction: formData.publicHolidayAction,
        publicHolidayExtraExGst: formData.publicHolidayExtraExGst ? parseFloat(formData.publicHolidayExtraExGst) : 0,
        description: formData.description,
        employeeId: formData.employeeId || undefined,
        employeePayExGst: formData.employeePayExGst ? parseFloat(formData.employeePayExGst) : 0
      };

      if (editingRule) {
        await billingRuleApi.updateBillingRule(editingRule.id, payload);
      } else {
        await billingRuleApi.createBillingRule(siteId!, payload);
      }

      await fetchSiteAndRules();
      handleCloseModal();
    } catch (err) {
      alert('保存规则失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, dayName: string) => {
    if (window.confirm(`确定要删除 ${dayName} 的计费与工资规则吗？`)) {
      try {
        await billingRuleApi.deleteBillingRule(id);
        await fetchSiteAndRules();
      } catch (err) {
        alert('删除失败');
      }
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex items-center space-x-3">
          <Link
            to={site ? `/clients/${site.clientId}/sites` : '/clients'}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">按星期计费与工资规则</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              当前站点: <span className="font-semibold text-primary">{site?.name || '加载中...'}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 text-white p-2.5 rounded-full shadow hover:bg-emerald-700 transition"
        >
          <Plus size={22} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border">加载计费规则中...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 bg-white rounded-xl border">{error}</div>
      ) : rules.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border">尚未设置任何按星期计费与工资规则</div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => {
            const assignedEmp = employees.find(e => e.id === rule.employeeId);
            const empDisplayName = rule.employeeName || assignedEmp?.name;

            return (
              <div key={rule.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <h3 className="font-bold text-base text-gray-900">
                    {DAYS_OF_WEEK[rule.dayOfWeek]}
                  </h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleOpenModal(rule)}
                      className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-50"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id, DAYS_OF_WEEK[rule.dayOfWeek])}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Client Charge */}
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span className="text-gray-600 font-medium">客户收费 (Ex GST)</span>
                    <span className="font-bold text-gray-900 text-sm">${rule.amountExGst.toFixed(2)}</span>
                  </div>

                  {/* Employee Wage */}
                  <div className="flex justify-between items-center bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                      <User size={14} />
                      <span>负责雇员 / 工资</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-900 text-sm">${(rule.employeePayExGst || 0).toFixed(2)}</div>
                      <div className="text-[10px] text-emerald-700">{empDisplayName || '未指定雇员'}</div>
                    </div>
                  </div>
                </div>

                {/* Public Holiday Handling */}
                <div className="flex justify-between items-center bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 text-xs">
                  <span className="text-blue-700 font-medium">公共假期规则</span>
                  <span className={`font-bold ${rule.publicHolidayAction === 'closed' ? 'text-red-500' : rule.publicHolidayAction === 'extra_charge' ? 'text-emerald-600' : 'text-gray-600'}`}>
                    {rule.publicHolidayAction === 'closed' ? '不营业 / 不收费' :
                      rule.publicHolidayAction === 'extra_charge' ? `加收 +$${(rule.publicHolidayExtraExGst || 0).toFixed(2)}` : '正常收费'}
                  </span>
                </div>

                {rule.description && (
                  <p className="text-xs text-gray-400 bg-gray-50 p-2 rounded-lg italic">备注: {rule.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden text-gray-900 shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold">{editingRule ? '编辑计费与工资规则' : '新增按星期计费与工资规则'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">星期 *</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={e => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none text-sm"
                  disabled={!!editingRule}
                >
                  {DAYS_OF_WEEK.map((day, index) => (
                    <option key={index} value={index}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">客户收费金额 (Ex GST) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.amountExGst}
                    onChange={e => setFormData({ ...formData, amountExGst: e.target.value })}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-primary focus:outline-none text-sm font-semibold"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Employee & Wage Section */}
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3">
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} />
                  负责雇员与雇员工资
                </div>

                <div>
                  <label className="block text-xs font-medium text-emerald-900 mb-1">指定负责雇员</label>
                  <select
                    value={formData.employeeId}
                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full border border-emerald-200 rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none text-sm bg-white"
                  >
                    <option value="">-- 暂不绑定雇员 --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.phone || '无电话'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-emerald-900 mb-1">雇员工资单价 (Ex GST)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.employeePayExGst}
                      onChange={e => setFormData({ ...formData, employeePayExGst: e.target.value })}
                      className="w-full pl-8 pr-4 py-2.5 border border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none text-sm font-semibold bg-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Public Holiday Section */}
              <div className="border-t pt-3">
                <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">公共假期处理方式 *</label>
                <select
                  value={formData.publicHolidayAction}
                  onChange={e => setFormData({ ...formData, publicHolidayAction: e.target.value })}
                  className="w-full border border-blue-200 rounded-xl p-2.5 focus:border-blue-500 focus:outline-none text-sm bg-blue-50/50"
                >
                  {PUBLIC_HOLIDAY_ACTIONS.map(action => (
                    <option key={action.value} value={action.value}>{action.label}</option>
                  ))}
                </select>
              </div>

              {formData.publicHolidayAction === 'extra_charge' && (
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <label className="block text-xs font-medium text-blue-800 mb-1">公共假期额外收费 (Ex GST)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required={formData.publicHolidayAction === 'extra_charge'}
                      value={formData.publicHolidayExtraExGst}
                      onChange={e => setFormData({ ...formData, publicHolidayExtraExGst: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 border border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm bg-white"
                      placeholder="50.00"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">备注说明</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none text-sm"
                  placeholder="可选填备注..."
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-bold text-sm shadow-md transition"
              >
                {saving ? '正在保存...' : '保存规则'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
