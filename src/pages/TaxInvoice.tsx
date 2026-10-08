import { useState, useEffect } from 'react';
import { taxInvoiceApi } from '../lib/taxInvoiceApi';
import { clientApi, type Client } from '../lib/clientApi';
import { employeeApi } from '../lib/employeeApi';
import { payrollApi } from '../lib/payrollApi';
import type { BusinessEntityDto, TaxInvoicePreviewDto } from '../types/taxInvoice';
import type { Employee } from '../types/employee';
import type { EmployeePayrollPreview, PaySlipPdfRequest } from '../types/payroll';
import { TaxInvoicePreviewTable } from '../components/TaxInvoice/TaxInvoicePreviewTable';
import { Loader2, Mail, Send, X, Receipt, Users, Download, MessageSquare, DollarSign, Calendar, Building, CheckCircle2 } from 'lucide-react';

const DAYS_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TaxInvoice() {
  const [activeTab, setActiveTab] = useState<'tax-invoice' | 'payroll'>('tax-invoice');

  // Shared States
  const [businesses, setBusinesses] = useState<BusinessEntityDto[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [periodStart, setPeriodStart] = useState<string>('');
  const [periodEnd, setPeriodEnd] = useState<string>('');

  // Tax Invoice Tab States
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [loadingClients, setLoadingClients] = useState(true);
  const [generatingTaxInvoice, setGeneratingTaxInvoice] = useState(false);
  const [taxInvoicePreview, setTaxInvoicePreview] = useState<TaxInvoicePreviewDto | null>(null);
  const [isTaxEmailModalOpen, setIsTaxEmailModalOpen] = useState(false);
  const [taxTargetEmailsInput, setTaxTargetEmailsInput] = useState('');
  const [taxEmailPdfType, setTaxEmailPdfType] = useState<'Full' | 'Simple' | 'DetailsOnly'>('Full');
  const [sendingTaxEmail, setSendingTaxEmail] = useState(false);

  // Payroll Tab States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [generatingPayroll, setGeneratingPayroll] = useState(false);
  const [payrollPreview, setPayrollPreview] = useState<EmployeePayrollPreview | null>(null);
  const [isPayEmailModalOpen, setIsPayEmailModalOpen] = useState(false);
  const [payTargetEmailsInput, setPayTargetEmailsInput] = useState('');
  const [sendingPayEmail, setSendingPayEmail] = useState(false);
  const [downloadingPayPdf, setDownloadingPayPdf] = useState(false);

  // SMS Modal States
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [smsPhoneInput, setSmsPhoneInput] = useState('');
  const [smsPeriodDescInput, setSmsPeriodDescInput] = useState('');
  const [sendingSms, setSendingSms] = useState(false);

  useEffect(() => {
    fetchBusinesses();
    fetchClients();
    fetchEmployees();
    setInitialDates();
  }, []);

  const setInitialDates = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setPeriodStart(start.toISOString().split('T')[0]);
    setPeriodEnd(end.toISOString().split('T')[0]);
  };

  const fetchBusinesses = async () => {
    try {
      const data = await taxInvoiceApi.getBusinesses();
      setBusinesses(data);
      if (data.length > 0) {
        setSelectedBusinessId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch businesses', err);
    }
  };

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const data = await clientApi.getClients();
      setClients(data.filter(c => c.isActive));
    } catch (err) {
      console.error('Failed to fetch clients', err);
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const data = await employeeApi.getEmployees();
      setEmployees(data.filter(e => e.isActive));
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // --- TAX INVOICE HANDLERS ---
  const handleGenerateTaxInvoicePreview = async () => {
    if (!selectedClientId || !periodStart || !periodEnd) return;
    try {
      setGeneratingTaxInvoice(true);
      const res = await taxInvoiceApi.generatePreview({
        clientId: selectedClientId,
        periodStart: new Date(periodStart).toISOString(),
        periodEnd: new Date(periodEnd).toISOString()
      });
      setTaxInvoicePreview(res);
    } catch (err: any) {
      alert(`Error generating Tax Invoice preview: ${err.message}`);
    } finally {
      setGeneratingTaxInvoice(false);
    }
  };

  const handleDownloadTaxInvoicePdf = async (pdfType: 'Full' | 'Simple' | 'DetailsOnly') => {
    if (!taxInvoicePreview || !selectedBusinessId) return;
    const biz = businesses.find(b => b.id === selectedBusinessId);
    if (!biz) return;

    try {
      setGeneratingTaxInvoice(true);
      const now = new Date();
      const invoiceNo = `INV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}-${taxInvoicePreview.clientId.substring(0, 4).toUpperCase()}`;
      const issueDate = now.toISOString().split('T')[0];
      const dueDateObj = new Date(now);
      dueDateObj.setDate(dueDateObj.getDate() + 7);
      const dueDate = dueDateObj.toISOString().split('T')[0];

      const blob = await taxInvoiceApi.downloadPdf({
        invoiceNo,
        issueDate,
        dueDate,
        preview: taxInvoicePreview,
        business: biz,
        pdfType
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TaxInvoice_${invoiceNo}_${pdfType}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Error downloading Tax Invoice PDF: ${err.message}`);
    } finally {
      setGeneratingTaxInvoice(false);
    }
  };

  const handleOpenTaxEmailModal = () => {
    if (!taxInvoicePreview) return;
    setTaxTargetEmailsInput(taxInvoicePreview.clientEmail || '');
    setIsTaxEmailModalOpen(true);
  };

  const handleSendTaxEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxInvoicePreview || !selectedBusinessId) return;
    const biz = businesses.find(b => b.id === selectedBusinessId);
    if (!biz) return;

    try {
      setSendingTaxEmail(true);
      const now = new Date();
      const invoiceNo = `INV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}-${taxInvoicePreview.clientId.substring(0, 4).toUpperCase()}`;
      const issueDate = now.toISOString().split('T')[0];
      const dueDateObj = new Date(now);
      dueDateObj.setDate(dueDateObj.getDate() + 7);
      const dueDate = dueDateObj.toISOString().split('T')[0];

      const res = await taxInvoiceApi.sendEmail({
        pdfRequest: {
          invoiceNo,
          issueDate,
          dueDate,
          preview: taxInvoicePreview,
          business: biz,
          pdfType: taxEmailPdfType
        },
        targetEmails: taxTargetEmailsInput
      });

      alert(`✅ Tax Invoice email sent successfully!\nMessage: ${res.message}\nBackup R2: ${res.r2Path || 'N/A'}`);
      setIsTaxEmailModalOpen(false);
    } catch (err: any) {
      alert(`❌ Failed to send Tax Invoice email: ${err.message}`);
    } finally {
      setSendingTaxEmail(false);
    }
  };

  // --- PAYROLL HANDLERS ---
  const handleGeneratePayrollPreview = async () => {
    if (!selectedEmployeeId || !periodStart || !periodEnd) return;
    try {
      setGeneratingPayroll(true);
      const res = await payrollApi.generatePreview({
        employeeId: selectedEmployeeId,
        periodStart: new Date(periodStart).toISOString(),
        periodEnd: new Date(periodEnd).toISOString()
      });
      setPayrollPreview(res);
    } catch (err: any) {
      alert(`Error generating payroll preview: ${err.message}`);
    } finally {
      setGeneratingPayroll(false);
    }
  };

  const getPaySlipPdfPayload = (): PaySlipPdfRequest | null => {
    if (!payrollPreview || !selectedBusinessId) return null;
    const biz = businesses.find(b => b.id === selectedBusinessId);
    if (!biz) return null;

    const now = new Date();
    const paySlipNo = `PS-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}-${payrollPreview.employeeId.substring(0, 4).toUpperCase()}`;
    const issueDate = now.toISOString().split('T')[0];

    return {
      paySlipNo,
      issueDate,
      preview: payrollPreview,
      business: biz
    };
  };

  const handleDownloadPaySlipPdf = async () => {
    const payload = getPaySlipPdfPayload();
    if (!payload) return;

    try {
      setDownloadingPayPdf(true);
      const blob = await payrollApi.downloadPdf(payload);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PaySlip_${payload.paySlipNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Error downloading Pay Slip PDF: ${err.message}`);
    } finally {
      setDownloadingPayPdf(false);
    }
  };

  const handleOpenPayEmailModal = () => {
    if (!payrollPreview) return;
    setPayTargetEmailsInput(payrollPreview.employeeEmail || '');
    setIsPayEmailModalOpen(true);
  };

  const handleSendPayEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = getPaySlipPdfPayload();
    if (!payload) return;

    try {
      setSendingPayEmail(true);
      const res = await payrollApi.sendEmail({
        pdfRequest: payload,
        targetEmails: payTargetEmailsInput
      });

      alert(`✅ Pay Slip email sent successfully!\nMessage: ${res.message}\nBackup R2: ${res.r2Path || 'N/A'}`);
      setIsPayEmailModalOpen(false);
    } catch (err: any) {
      alert(`❌ Failed to send Pay Slip email: ${err.message}`);
    } finally {
      setSendingPayEmail(false);
    }
  };

  const handleOpenSmsModal = () => {
    if (!payrollPreview) return;
    setSmsPhoneInput(payrollPreview.employeePhone || '');
    const pStartStr = new Date(periodStart).toLocaleDateString('zh-CN');
    const pEndStr = new Date(periodEnd).toLocaleDateString('zh-CN');
    setSmsPeriodDescInput(`${pStartStr} 至 ${pEndStr}`);
    setIsSmsModalOpen(true);
  };

  const handleSendSmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payrollPreview) return;

    try {
      setSendingSms(true);
      const res = await payrollApi.sendSms({
        employeeId: payrollPreview.employeeId,
        amount: payrollPreview.totalPayExGst,
        periodDescription: smsPeriodDescInput,
        customPhone: smsPhoneInput
      });

      alert(`📱 Transfer SMS sent successfully!\nPhone: ${res.phone}\nDetails: ${res.message}`);
      setIsSmsModalOpen(false);
    } catch (err: any) {
      alert(`❌ Failed to send transfer SMS: ${err.message}`);
    } finally {
      setSendingSms(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header & Tab Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Receipt className="text-primary" size={28} />
            账单与结算中心
          </h1>
          <p className="text-xs text-gray-500 mt-1">客户商业 Tax Invoice 生成导出与雇员工资单 Pay Slip 结算通知</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('tax-invoice')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'tax-invoice'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Receipt size={16} />
            客户 Tax Invoice
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'payroll'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <DollarSign size={16} />
            雇员工资结算 (Pay Slip)
          </button>
        </div>
      </div>

      {/* Control Panel Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Business Entity Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Building size={14} className="text-gray-400" />
              开票/结算经营主体 (Business Entity) *
            </label>
            <select
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none bg-white text-sm font-medium"
            >
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.name} (ABN: {b.abn})</option>
              ))}
            </select>
          </div>

          {/* Dynamic Target Selection (Client or Employee) */}
          {activeTab === 'tax-invoice' ? (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Building size={14} className="text-gray-400" />
                选择目标客户 (Target Client) *
              </label>
              {loadingClients ? (
                <div className="text-xs text-gray-400 py-2.5">加载客户列表中...</div>
              ) : (
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none bg-white text-sm font-medium"
                >
                  <option value="">-- 请选择商业客户 --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.abn ? `(ABN: ${c.abn})` : ''}</option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Users size={14} className="text-gray-400" />
                选择结算雇员 (Target Employee) *
              </label>
              {loadingEmployees ? (
                <div className="text-xs text-gray-400 py-2.5">加载雇员列表中...</div>
              ) : (
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none bg-white text-sm font-medium"
                >
                  <option value="">-- 请选择雇员团队成员 --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.phone || '无电话'})</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Date Period Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              结算周期起始日期 (Period Start)
            </label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              结算周期截止日期 (Period End)
            </label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none text-sm font-mono"
            />
          </div>
        </div>

        {/* Generate Button */}
        {activeTab === 'tax-invoice' ? (
          <button
            onClick={handleGenerateTaxInvoicePreview}
            disabled={generatingTaxInvoice || !selectedClientId || !selectedBusinessId || !periodStart || !periodEnd}
            className="w-full bg-[#C8102E] text-white py-3 rounded-xl hover:bg-red-800 transition disabled:bg-red-300 disabled:text-white disabled:cursor-not-allowed flex justify-center items-center font-bold text-sm shadow-md"
          >
            {generatingTaxInvoice ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                正在生成 Tax Invoice 明细预览...
              </>
            ) : (
              '生成客户 Tax Invoice 账单预览'
            )}
          </button>
        ) : (
          <button
            onClick={handleGeneratePayrollPreview}
            disabled={generatingPayroll || !selectedEmployeeId || !selectedBusinessId || !periodStart || !periodEnd}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition disabled:bg-emerald-300 disabled:text-white disabled:cursor-not-allowed flex justify-center items-center font-bold text-sm shadow-md"
          >
            {generatingPayroll ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                正在自动算次算薪生成 Pay Slip...
              </>
            ) : (
              '自动算次算薪 - 生成雇员工资单预览'
            )}
          </button>
        )}
      </div>

      {/* --- TAB 1 CONTENT: TAX INVOICE PREVIEW --- */}
      {activeTab === 'tax-invoice' && taxInvoicePreview && (
        <div className="space-y-6">
          <TaxInvoicePreviewTable preview={taxInvoicePreview} onUpdatePreview={setTaxInvoicePreview} />

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleOpenTaxEmailModal}
              disabled={generatingTaxInvoice || !taxInvoicePreview || taxInvoicePreview.items.length === 0}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition font-bold text-sm disabled:opacity-50 flex justify-center items-center shadow-md min-w-[150px]"
            >
              <Mail className="mr-2" size={18} />
              发送账单 Email
            </button>
            <button
              onClick={() => handleDownloadTaxInvoicePdf('Full')}
              disabled={generatingTaxInvoice || !taxInvoicePreview || taxInvoicePreview.items.length === 0}
              className="flex-1 bg-primary text-white py-3 rounded-xl hover:bg-red-700 transition font-bold text-sm disabled:opacity-50 flex justify-center items-center shadow-md min-w-[150px]"
            >
              <Download className="mr-2" size={18} />
              下载 Full PDF
            </button>
            <button
              onClick={() => handleDownloadTaxInvoicePdf('Simple')}
              disabled={generatingTaxInvoice || !taxInvoicePreview || taxInvoicePreview.items.length === 0}
              className="flex-1 bg-primary text-white py-3 rounded-xl hover:bg-red-700 transition font-bold text-sm disabled:opacity-50 flex justify-center items-center shadow-md min-w-[150px]"
            >
              <Download className="mr-2" size={18} />
              下载 Simple PDF
            </button>
            <button
              onClick={() => handleDownloadTaxInvoicePdf('DetailsOnly')}
              disabled={generatingTaxInvoice || !taxInvoicePreview || taxInvoicePreview.items.length === 0}
              className="flex-1 bg-primary text-white py-3 rounded-xl hover:bg-red-700 transition font-bold text-sm disabled:opacity-50 flex justify-center items-center shadow-md min-w-[150px]"
            >
              <Download className="mr-2" size={18} />
              下载 Details PDF
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 2 CONTENT: PAYROLL PREVIEW --- */}
      {activeTab === 'payroll' && payrollPreview && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">结算雇员 (Employee)</p>
              <h3 className="text-lg font-black text-gray-900 mt-1">{payrollPreview.employeeName}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{payrollPreview.employeePhone || '未填写电话'} | {payrollPreview.employeeEmail || '未填写 Email'}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">完成班次 (Total Shifts)</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{payrollPreview.totalServices} 次</h3>
              <p className="text-xs text-gray-500 mt-0.5">{new Date(periodStart).toLocaleDateString()} – {new Date(periodEnd).toLocaleDateString()}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm bg-gradient-to-br from-emerald-500/5 to-teal-500/10 border-emerald-100">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">总应付工资 (Total Net Pay)</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">${payrollPreview.totalPayExGst.toFixed(2)}</h3>
              <p className="text-xs text-emerald-600 mt-0.5">免 GST / 转账支付金额</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                服务班次明细与工资汇总 ({payrollPreview.items.length} 笔)
              </h3>
            </div>

            {payrollPreview.items.length === 0 ? (
              <div className="text-center py-12 text-gray-400">该时期内未找到该雇员的任何排班班次记录</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] tracking-wider border-b">
                    <tr>
                      <th className="p-4">服务日期 (Date)</th>
                      <th className="p-4">星期 (Day)</th>
                      <th className="p-4">站点名称 (Site)</th>
                      <th className="p-4">描述 / 假期备注 (Note)</th>
                      <th className="p-4 text-right">雇员工资 (Pay Ex GST)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payrollPreview.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50/80 transition">
                        <td className="p-4 font-mono text-gray-900">{new Date(item.serviceDate).toLocaleDateString('zh-CN')}</td>
                        <td className="p-4 text-gray-600 font-medium">{DAYS_NAMES[item.dayOfWeek]}</td>
                        <td className="p-4 font-bold text-gray-900">{item.siteName}</td>
                        <td className="p-4 text-xs text-gray-500">{item.note || item.description || '-'}</td>
                        <td className="p-4 text-right font-bold text-emerald-700 font-mono">${item.payExGst.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-emerald-50/50 font-bold border-t border-emerald-100">
                    <tr>
                      <td colSpan={4} className="p-4 text-right text-gray-700">总计应付工资 (Total Net Pay):</td>
                      <td className="p-4 text-right text-emerald-800 text-base font-mono">${payrollPreview.totalPayExGst.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadPaySlipPdf}
              disabled={downloadingPayPdf || payrollPreview.items.length === 0}
              className="flex-1 bg-primary text-white py-3 rounded-xl hover:bg-red-700 transition font-bold text-sm disabled:opacity-50 flex justify-center items-center shadow-md min-w-[160px]"
            >
              {downloadingPayPdf ? <Loader2 className="animate-spin mr-2" size={18} /> : <Download className="mr-2" size={18} />}
              下载 Pay Slip PDF
            </button>

            <button
              onClick={handleOpenPayEmailModal}
              disabled={payrollPreview.items.length === 0}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition font-bold text-sm disabled:opacity-50 flex justify-center items-center shadow-md min-w-[160px]"
            >
              <Mail className="mr-2" size={18} />
              发送工资单 Email
            </button>

            <button
              onClick={handleOpenSmsModal}
              disabled={payrollPreview.items.length === 0}
              className="flex-1 bg-amber-500 text-white py-3 rounded-xl hover:bg-amber-600 transition font-bold text-sm disabled:opacity-50 flex justify-center items-center shadow-md min-w-[160px]"
            >
              <MessageSquare className="mr-2" size={18} />
              发送打款短信通知
            </button>
          </div>
        </div>
      )}

      {/* TAX EMAIL MODAL */}
      {isTaxEmailModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden text-gray-900 shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Mail className="text-primary" size={20} />
                发送 Tax Invoice 账单邮件
              </h2>
              <button onClick={() => setIsTaxEmailModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSendTaxEmailSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">收件人 Email *</label>
                <input
                  type="text"
                  required
                  value={taxTargetEmailsInput}
                  onChange={e => setTaxTargetEmailsInput(e.target.value)}
                  placeholder="primary@client.com, cc@client.com"
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none text-sm"
                />
                <p className="text-[11px] text-gray-400 mt-1">支持逗号分割多个邮箱，第一个为主收件人(To)，后续为抄送(CC)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">PDF 格式模式</label>
                <select
                  value={taxEmailPdfType}
                  onChange={e => setTaxEmailPdfType(e.target.value as any)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:outline-none text-sm bg-white"
                >
                  <option value="Full">Full (包含完整汇总页与附件明细表)</option>
                  <option value="Simple">Simple (仅汇总页)</option>
                  <option value="DetailsOnly">Details Only (仅班次明细表)</option>
                </select>
              </div>

              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-xs text-blue-700">
                发送成功后，PDF 附件将自动备份保存至 Cloudflare R2 存储。
              </div>

              <button
                type="submit"
                disabled={sendingTaxEmail}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-bold text-sm shadow-md transition flex items-center justify-center"
              >
                {sendingTaxEmail ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    正在发送并备份至 R2...
                  </>
                ) : (
                  <>
                    <Send className="mr-1.5" size={16} />
                    确认发送账单邮件
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PAYROLL EMAIL MODAL */}
      {isPayEmailModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden text-gray-900 shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Mail className="text-emerald-600" size={20} />
                发送 Pay Slip 工资单邮件
              </h2>
              <button onClick={() => setIsPayEmailModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSendPayEmailSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">雇员 Email 地址 *</label>
                <input
                  type="text"
                  required
                  value={payTargetEmailsInput}
                  onChange={e => setPayTargetEmailsInput(e.target.value)}
                  placeholder="employee@example.com"
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none text-sm"
                />
                <p className="text-[11px] text-gray-400 mt-1">系统将自动附带最新生成的格式化 Pay Slip PDF</p>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-800">
                邮件发送成功后，Pay Slip PDF 将同步存储备份至 Cloudflare R2。
              </div>

              <button
                type="submit"
                disabled={sendingPayEmail}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-bold text-sm shadow-md transition flex items-center justify-center"
              >
                {sendingPayEmail ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    正在发送工资单并备份...
                  </>
                ) : (
                  <>
                    <Send className="mr-1.5" size={16} />
                    发送 Pay Slip 邮件
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SMS MODAL */}
      {isSmsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden text-gray-900 shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <MessageSquare className="text-amber-500" size={20} />
                发送 ClickSend 实效转账短信通知
              </h2>
              <button onClick={() => setIsSmsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSendSmsSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">接收手机号码 *</label>
                <input
                  type="text"
                  required
                  value={smsPhoneInput}
                  onChange={e => setSmsPhoneInput(e.target.value)}
                  placeholder="0412345678"
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-amber-500 focus:outline-none text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">结算周期描述 *</label>
                <input
                  type="text"
                  required
                  value={smsPeriodDescInput}
                  onChange={e => setSmsPeriodDescInput(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-amber-500 focus:outline-none text-sm"
                  placeholder="例如: 2026/10/01 至 2026/10/31"
                />
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-1 text-xs text-amber-900">
                <p className="font-bold">短信实时内容预览:</p>
                <p className="italic bg-white p-2.5 rounded-lg border border-amber-200/60 font-mono text-gray-800">
                  "尊敬的 {payrollPreview?.employeeName}，您在 {smsPeriodDescInput} 的工资 ${payrollPreview?.totalPayExGst.toFixed(2)} 已转账完成。-- NHN Power"
                </p>
              </div>

              <button
                type="submit"
                disabled={sendingSms}
                className="w-full bg-amber-500 text-white py-3 rounded-xl hover:bg-amber-600 disabled:opacity-50 font-bold text-sm shadow-md transition flex items-center justify-center"
              >
                {sendingSms ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    正在通过 ClickSend 发送短信...
                  </>
                ) : (
                  <>
                    <Send className="mr-1.5" size={16} />
                    发送打款成功通知短信
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
