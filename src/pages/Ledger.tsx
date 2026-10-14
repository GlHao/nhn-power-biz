import { useState, useEffect } from 'react';
import {
  ledgerApi,
  receiptsApi,
  LedgerQuarterSummary,
  LedgerTransaction,
  LedgerRule,
  ReceiptItem,
  LedgerBusiness
} from '../api/v3Api';
import {
  BookOpen,
  Receipt as ReceiptIcon,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  Tag,
  Divide,
  ChevronRight,
  ArrowLeft,
  Edit3,
  Building2
} from 'lucide-react';

const DEFAULT_BUSINESSES: LedgerBusiness[] = [
  { id: 'business_1', code: 'NHN_POWER', name: 'NHN POWER', sortOrder: 0 },
  { id: 'business_2', code: 'N_SHA_AND_H_WANG', name: 'N SHA AND H WANG', sortOrder: 1 },
];

export default function Ledger() {
  const [activeTab, setActiveTab] = useState<'quarters' | 'receipts' | 'rules'>('quarters');

  // Business state
  const [businesses, setBusinesses] = useState<LedgerBusiness[]>(DEFAULT_BUSINESSES);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('NHN POWER');
  const [uploadBusiness, setUploadBusiness] = useState<string>('NHN POWER');

  // Quarters state
  const [quarters, setQuarters] = useState<LedgerQuarterSummary[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState<LedgerQuarterSummary | null>(null);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [_loading, setLoading] = useState(false);

  // Modals state
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItem | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<ReceiptItem | null>(null);
  const [editMerchant, setEditMerchant] = useState('');
  const [editTotal, setEditTotal] = useState('');
  const [editGst, setEditGst] = useState('');
  const [editDate, setEditDate] = useState('');

  // Upload files state
  const [uploading, setUploading] = useState(false);

  // Rules state
  const [rules, setRules] = useState<LedgerRule[]>([]);
  const [editingRule, setEditingRule] = useState<LedgerRule | null>(null);
  const [ruleKeyword, setRuleKeyword] = useState('');
  const [ruleCategory, setRuleCategory] = useState('');
  const [ruleSearchTerm, setRuleSearchTerm] = useState('');
  const [loadingRules, setLoadingRules] = useState(false);

  // Receipts pool state
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [receiptFilter, setReceiptFilter] = useState<'all' | 'pending' | 'matched'>('all');

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInitialData();
    loadRules();
    loadReceipts();
  }, []);

  // When switching tabs, automatically refresh rules or receipts
  useEffect(() => {
    if (activeTab === 'rules') {
      loadRules();
    } else if (activeTab === 'receipts') {
      loadReceipts();
    }
  }, [activeTab]);

  const loadInitialData = async () => {
    try {
      const bRes = await ledgerApi.getBusinesses();
      if (bRes && bRes.success && Array.isArray(bRes.data) && bRes.data.length > 0) {
        setBusinesses(bRes.data);
        const defaultBiz = bRes.data[0].name;
        setSelectedBusiness(defaultBiz);
        setUploadBusiness(defaultBiz);
        await loadQuarters(defaultBiz);
        return;
      }
    } catch (err) {
      console.error('Failed to load businesses', err);
    }
    setBusinesses(DEFAULT_BUSINESSES);
    setSelectedBusiness('NHN POWER');
    setUploadBusiness('NHN POWER');
    await loadQuarters('NHN POWER');
  };

  const loadQuarters = async (businessName?: string) => {
    const biz = businessName || selectedBusiness;
    setLoading(true);
    try {
      const res = await ledgerApi.getQuarters(biz);
      if (res.success) {
        setQuarters(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load quarters', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBusiness = async (bizName: string) => {
    setSelectedBusiness(bizName);
    setUploadBusiness(bizName);
    setSelectedQuarter(null);
    setTransactions([]);
    await loadQuarters(bizName);
  };

  const loadQuarterTransactions = async (quarter: LedgerQuarterSummary) => {
    setSelectedQuarter(quarter);
    setLoading(true);
    try {
      const res = await ledgerApi.getQuarterTransactions(quarter.id);
      if (res.success) {
        setTransactions(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRules = async () => {
    setLoadingRules(true);
    try {
      const res = await ledgerApi.getRules();
      if (res && res.success) {
        setRules(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load rules', err);
    } finally {
      setLoadingRules(false);
    }
  };

  const loadReceipts = async () => {
    try {
      const res = await receiptsApi.getAll(receiptFilter === 'all' ? undefined : receiptFilter);
      if (res.success) {
        setReceipts(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load receipts', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'receipts') {
      loadReceipts();
    }
  }, [receiptFilter, activeTab]);

  // File Upload Handlers
  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const res = await ledgerApi.importBankCsv(base64, file.name, uploadBusiness);
          if (res.success) {
            alert(`导入成功！共 ${res.data.totalTransactions} 条交易，自动规则匹配 ${res.data.ruleMatchedCount} 条，关联小票 ${res.data.receiptMatchedCount} 条。`);
            setShowCsvModal(false);
            setSelectedBusiness(uploadBusiness);
            await loadQuarters(uploadBusiness);
          } else {
            alert('CSV 导入失败：' + (res.error || '未知错误'));
          }
        } catch (err: any) {
          console.error('Upload CSV failed', err);
          alert('CSV 导入失败：' + (err?.response?.data?.error || err.message || '网络或服务端异常'));
        } finally {
          setUploading(false);
          if (e.target) e.target.value = '';
        }
      };
      reader.onerror = () => {
        alert('文件读取失败');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Upload CSV failed', err);
      alert('上传异常: ' + (err.message || '未知错误'));
      setUploading(false);
    }
  };

  const handleExcelHistoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const res = await ledgerApi.importHistoryExcel(base64, file.name, uploadBusiness);
          if (res.success) {
            alert(`历史账本导入成功！\n解析 ${res.data.totalRowsParsed} 行明细，新增规则 ${res.data.rulesLearned} 条，已同步生成/更新对应季度账本。`);
            setShowExcelModal(false);
            await loadRules();
            setSelectedBusiness(uploadBusiness);
            await loadQuarters(uploadBusiness);
          } else {
            alert('历史 Excel 导入失败：' + (res.error || '未知错误'));
          }
        } catch (err: any) {
          console.error('Upload history failed', err);
          alert('历史 Excel 导入失败：' + (err?.response?.data?.error || err.message || '网络或服务端异常'));
        } finally {
          setUploading(false);
          if (e.target) e.target.value = '';
        }
      };
      reader.onerror = () => {
        alert('文件读取失败');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Upload Excel failed', err);
      alert('上传异常: ' + (err.message || '未知错误'));
      setUploading(false);
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await receiptsApi.upload(base64, file.name, file.type);
        if (res.success) {
          const item = res.data;
          if (item.totalAmount > 0) {
            alert(`小票识别成功！\n商户：${item.merchantName || '未知'}\n总金额：$${item.totalAmount}\nGST：$${item.gstAmount}`);
          } else {
            alert(`小票已保存！\n注意：OCR 未能自动提取到明确金额（识别为 $0.00）。\n您可以在小票列表卡片上点击“编辑/补录”手动填入金额与 GST。`);
          }
          await loadReceipts();
          if (selectedQuarter) {
            await loadQuarterTransactions(selectedQuarter);
          }
        } else {
          alert('小票上传解析失败：' + res.error);
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload receipt failed', err);
      alert('小票上传异常');
      setUploading(false);
    }
  };

  const openReceiptEditModal = (r: ReceiptItem) => {
    setEditingReceipt(r);
    setEditMerchant(r.merchantName || '');
    setEditTotal(r.totalAmount ? r.totalAmount.toString() : '');
    setEditGst(r.gstAmount ? r.gstAmount.toString() : '');
    setEditDate(r.transactionDate ? r.transactionDate.split('T')[0] : '');
  };

  const handleSaveReceiptEdit = async () => {
    if (!editingReceipt) return;
    try {
      const parsedTotal = parseFloat(editTotal) || 0;
      const parsedGst = parseFloat(editGst) || 0;
      const res = await receiptsApi.update(editingReceipt.id, {
        merchantName: editMerchant,
        totalAmount: parsedTotal,
        gstAmount: parsedGst,
        transactionDate: editDate ? new Date(editDate).toISOString() : undefined,
      });
      if (res.success) {
        alert('小票信息已保存！');
        setEditingReceipt(null);
        await loadReceipts();
        if (selectedQuarter) {
          await loadQuarterTransactions(selectedQuarter);
        }
      } else {
        alert('保存失败：' + res.error);
      }
    } catch (err) {
      console.error('Failed to update receipt', err);
      alert('保存异常');
    }
  };

  // Transaction Edits & ÷11 Calculator
  const handleDivide11 = async (tx: LedgerTransaction) => {
    const sign = tx.amount < 0 ? -1 : 1;
    const calcGst = (Math.round((Math.abs(tx.amount) / 11) * 100) / 100) * sign;
    try {
      const res = await ledgerApi.updateTransaction(tx.id, { gstAmount: calcGst });
      if (res.success) {
        setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, gstAmount: calcGst } : t));
      }
    } catch (err) {
      console.error('Failed to update GST', err);
    }
  };

  const handleNoteChange = async (txId: string, notes: string) => {
    try {
      await ledgerApi.updateTransaction(txId, { notes });
      setTransactions(prev => prev.map(t => t.id === txId ? { ...t, notes } : t));
    } catch (err) {
      console.error('Failed to update note', err);
    }
  };

  const handleGstChange = async (txId: string, gstAmount: number) => {
    try {
      await ledgerApi.updateTransaction(txId, { gstAmount });
      setTransactions(prev => prev.map(t => t.id === txId ? { ...t, gstAmount } : t));
    } catch (err) {
      console.error('Failed to update GST', err);
    }
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (!confirm('确定删除该笔账目交易记录吗？')) return;
    try {
      const res = await ledgerApi.deleteTransaction(txId);
      if (res.success) {
        setTransactions(prev => prev.filter(t => t.id !== txId));
        // Refresh quarters list so stats in the background stay synced
        if (selectedBusiness) {
          loadQuarters(selectedBusiness);
        }
      } else {
        alert('删除账目失败：' + (res.error || '未知错误'));
      }
    } catch (err: any) {
      console.error('Delete transaction failed', err);
      alert('删除账目异常: ' + (err.message || '未知错误'));
    }
  };

  const handleAutoMatch = async () => {
    if (!selectedQuarter) return;
    setLoading(true);
    try {
      const res = await ledgerApi.autoMatchReceipts(selectedQuarter.id);
      if (res.success) {
        alert(`小票重新匹配完成，共关联 ${res.data.matchedCount} 笔小票。`);
        await loadQuarterTransactions(selectedQuarter);
      }
    } catch (err) {
      console.error('Auto match failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeQuarter = async () => {
    if (!selectedQuarter) return;
    if (!confirm(`确定结算并归档季度 ${selectedQuarter.yearQuarter} 吗？完成归档后记录状态将锁定。`)) return;

    try {
      const res = await ledgerApi.finalizeQuarter(selectedQuarter.id);
      if (res.success) {
        alert('季度归档完成！');
        await loadQuarters();
        await loadQuarterTransactions({ ...selectedQuarter, status: 'completed' });
      }
    } catch (err) {
      console.error('Finalize failed', err);
    }
  };

  const handleDeleteQuarter = async (quarterId: string, quarterName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`确定彻底删除季度【${quarterName}】及其所有交易明细吗？\n此操作不可撤销！`)) return;

    try {
      const res = await ledgerApi.deleteQuarter(quarterId);
      if (res.success) {
        alert(`季度【${quarterName}】已删除！`);
        if (selectedQuarter?.id === quarterId) {
          setSelectedQuarter(null);
        }
        await loadQuarters();
      } else {
        alert('删除失败：' + res.error);
      }
    } catch (err) {
      console.error('Delete quarter failed', err);
      alert('删除异常');
    }
  };

  const handleExportExcel = async () => {
    if (!selectedQuarter) return;
    try {
      const blob = await ledgerApi.exportQuarterExcel(selectedQuarter.id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Ledger_${selectedQuarter.yearQuarter}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export Excel failed', err);
    }
  };

  const handleOpenAddRule = () => {
    setEditingRule(null);
    setRuleKeyword('');
    setRuleCategory('');
    setShowRuleModal(true);
  };

  const handleOpenEditRule = (r: LedgerRule) => {
    setEditingRule(r);
    setRuleKeyword(r.keyword);
    setRuleCategory(r.categoryNote);
    setShowRuleModal(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleKeyword.trim() || !ruleCategory.trim()) return;
    try {
      if (editingRule) {
        const res = await ledgerApi.updateRule(editingRule.id, {
          keyword: ruleKeyword.trim(),
          categoryNote: ruleCategory.trim()
        });
        if (res && res.success) {
          setShowRuleModal(false);
          setEditingRule(null);
          await loadRules();
        } else {
          alert((res && res.message) || '更新规则失败');
        }
      } else {
        const res = await ledgerApi.createOrUpdateRule({
          keyword: ruleKeyword.trim(),
          categoryNote: ruleCategory.trim()
        });
        if (res && res.success) {
          setShowRuleModal(false);
          await loadRules();
        } else {
          alert((res && res.message) || '添加规则失败');
        }
      }
    } catch (err) {
      console.error('Save rule failed', err);
      alert('保存规则失败，请检查网络或后端状态');
    }
  };

  const handleDeleteRule = async (id: string, keyword?: string) => {
    const kwDisplay = keyword ? `【${keyword}】` : '';
    if (!confirm(`确定删除分类规则${kwDisplay}吗？`)) return;
    try {
      const res = await ledgerApi.deleteRule(id);
      if (res && res.success) {
        await loadRules();
      } else {
        alert((res && res.message) || '删除规则失败');
      }
    } catch (err) {
      console.error('Delete rule failed', err);
      alert('删除失败，请检查网络或后端状态');
    }
  };

  const filteredRules = rules.filter(r =>
    r.keyword.toLowerCase().includes(ruleSearchTerm.toLowerCase()) ||
    r.categoryNote.toLowerCase().includes(ruleSearchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter(t => 
    t.bankDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-amber-200/60 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <BookOpen size={24} />
            </span>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Ledger & Receipts 账本与小票管理</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            智能 CSV 规则分类 · 自动小票 OCR 匹配 · BAS 报税 Excel 归档导出
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setUploadBusiness(selectedBusiness || (businesses[0]?.name ?? 'NHN POWER'));
              setShowExcelModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-all shadow-sm"
          >
            <Sparkles size={16} className="text-amber-600" />
            导入历史 Excel 学习规则
          </button>

          <button
            onClick={() => {
              setUploadBusiness(selectedBusiness || (businesses[0]?.name ?? 'NHN POWER'));
              setShowCsvModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 transition-all shadow-md shadow-amber-500/20"
          >
            <Upload size={16} />
            上传银行 CSV 账单
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-amber-200/60 pb-1">
        <button
          onClick={() => { setActiveTab('quarters'); setSelectedQuarter(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === 'quarters'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-600 hover:bg-amber-50 hover:text-amber-800'
          }`}
        >
          <FileSpreadsheet size={18} />
          季度账本 (Ledger Quarters)
        </button>

        <button
          onClick={() => setActiveTab('receipts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === 'receipts'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-600 hover:bg-amber-50 hover:text-amber-800'
          }`}
        >
          <ReceiptIcon size={18} />
          小票库 (Receipts Pool)
          {receipts.filter(r => r.status === 'pending').length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-bold animate-pulse">
              {receipts.filter(r => r.status === 'pending').length} 待匹配
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === 'rules'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-600 hover:bg-amber-50 hover:text-amber-800'
          }`}
        >
          <Tag size={18} />
          分类规则库 (Rules: {rules.length})
        </button>
      </div>

      {/* TAB 1: QUARTERS & TRANSACTIONS */}
      {activeTab === 'quarters' && (
        <>
          {/* Quarter Details View */}
          {selectedQuarter ? (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedQuarter(null)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    <ArrowLeft size={18} />
                  </button>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-amber-400 font-extrabold text-xs shadow-sm">
                        {selectedQuarter.business || selectedBusiness}
                      </span>
                      <span>{selectedQuarter.yearQuarter} 账本明细</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        selectedQuarter.status === 'completed' ? 'bg-slate-100 text-slate-700 border border-slate-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {selectedQuarter.status === 'completed' ? '已归档 (Completed)' : '草稿中 (Draft)'}
                      </span>
                    </h2>
                    {(() => {
                      const totalGst = transactions.reduce((acc, t) => acc + t.gstAmount, 0);
                      const totalIncome = transactions.reduce((acc, t) => acc + (t.amount > 0 ? t.amount : 0), 0);
                      const totalExpense = transactions.reduce((acc, t) => acc + (t.amount < 0 ? t.amount : 0), 0);
                      return (
                        <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500 mt-1 font-medium">
                          <span>交易总数：<b className="text-slate-800">{transactions.length}</b> 笔</span>
                          <span>收入总计：<b className="text-emerald-700 font-bold">+${totalIncome.toFixed(2)}</b></span>
                          <span>支出总计：<b className="text-red-600 font-bold">-${Math.abs(totalExpense).toFixed(2)}</b></span>
                          <span>GST 净额：<b className={`font-bold ${totalGst < 0 ? 'text-red-600' : totalGst > 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
                            {totalGst < 0 ? `-$${Math.abs(totalGst).toFixed(2)}` : totalGst > 0 ? `+$${totalGst.toFixed(2)}` : '$0.00'}
                          </b></span>
                        </div>
                      );
                    })()}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="搜索说明/银行描述..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs w-48 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <button
                    onClick={handleAutoMatch}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition shadow-sm"
                  >
                    <RefreshCw size={14} />
                    重新配对小票
                  </button>

                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 text-white hover:bg-slate-900 transition shadow-sm"
                  >
                    <Download size={14} />
                    导出 .xlsx
                  </button>

                  {selectedQuarter.status !== 'completed' && (
                    <button
                      onClick={handleFinalizeQuarter}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition shadow-sm"
                    >
                      <CheckCircle2 size={14} />
                      完成结算归档
                    </button>
                  )}

                  <button
                    onClick={(e) => handleDeleteQuarter(selectedQuarter.id, selectedQuarter.yearQuarter, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition shadow-sm"
                    title="删除该季度及全部记录"
                  >
                    <Trash2 size={14} />
                    删除季度
                  </button>
                </div>
              </div>

              {/* Status Color Legend */}
              <div className="flex flex-wrap items-center gap-4 px-4 py-2 bg-amber-50/50 rounded-xl border border-amber-200/50 text-xs">
                <span className="font-semibold text-slate-700">视觉状态标识：</span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-medium">
                  <AlertCircle size={12} className="text-amber-600" /> 🟡 未分类 (uncategorized)
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-medium">
                  🔵 自动规则分类 (rule_matched)
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-300 font-semibold">
                  🟢 小票匹配成功 (receipt_matched)
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-medium">
                  ⚪ 完成归档 (completed)
                </span>
              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-3 text-center w-12 font-mono text-slate-400">#</th>
                        <th className="py-3 px-4">DATE</th>
                        <th className="py-3 px-4">AMOUNT</th>
                        <th className="py-3 px-4">GST</th>
                        <th className="py-3 px-4">BANK DESCRIPTION</th>
                        <th className="py-3 px-4">BALANCE</th>
                        <th className="py-3 px-4">说明 (Category / Notes)</th>
                        <th className="py-3 px-4 text-center">状态 / 小票关联</th>
                        <th className="py-3 px-3 text-center w-14">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredTransactions.map((t, index) => {
                        let bgStyle = 'bg-white hover:bg-slate-50';
                        if (t.status === 'uncategorized') bgStyle = 'bg-amber-50/90 hover:bg-amber-100/90 border-l-4 border-amber-400';
                        else if (t.status === 'rule_matched') bgStyle = 'bg-blue-50/70 hover:bg-blue-100/70 border-l-4 border-blue-400';
                        else if (t.status === 'receipt_matched') bgStyle = 'bg-emerald-50/80 hover:bg-emerald-100/80 border-l-4 border-emerald-500';

                        return (
                          <tr key={t.id} className={`transition ${bgStyle}`}>
                            <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold text-xs whitespace-nowrap">
                              {index + 1}
                            </td>

                            <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                              {new Date(t.transactionDate).toLocaleDateString('en-AU')}
                            </td>

                            <td className={`py-3 px-4 font-bold whitespace-nowrap ${t.amount < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                              {t.amount < 0 ? `-$${Math.abs(t.amount).toFixed(2)}` : `+$${t.amount.toFixed(2)}`}
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold ${
                                  t.gstAmount < 0 ? 'text-red-600' : t.gstAmount > 0 ? 'text-emerald-700' : 'text-slate-400'
                                }`}>
                                  {t.gstAmount < 0 ? '-$' : t.gstAmount > 0 ? '+$' : '$'}
                                </span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={Math.abs(t.gstAmount) === 0 ? '' : Math.abs(t.gstAmount)}
                                  placeholder="0.00"
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    const sign = t.amount < 0 ? -1 : 1;
                                    handleGstChange(t.id, Math.round(Math.abs(val) * 100) / 100 * sign);
                                  }}
                                  disabled={selectedQuarter.status === 'completed'}
                                  className={`w-20 px-2 py-1 rounded border text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white ${
                                    t.gstAmount < 0 ? 'border-red-200 text-red-600 font-bold' : t.gstAmount > 0 ? 'border-emerald-200 text-emerald-700 font-bold' : 'border-slate-300 text-slate-700'
                                  }`}
                                />
                                {selectedQuarter.status !== 'completed' && (
                                  <button
                                    onClick={() => handleDivide11(t)}
                                    title="点击一键以 (AMOUNT / 11) 计算 GST 并自动匹配正负号"
                                    className="p-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 transition font-bold text-[10px] flex items-center gap-0.5 border border-amber-300"
                                  >
                                    <Divide size={12} />11
                                  </button>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4 font-mono text-slate-800 max-w-xs truncate" title={t.bankDescription}>
                              {t.bankDescription}
                            </td>

                            <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                              {t.balance ? `$${t.balance.toFixed(2)}` : '-'}
                            </td>

                            <td className="py-3 px-4">
                              <input
                                type="text"
                                defaultValue={t.notes || ''}
                                onBlur={(e) => handleNoteChange(t.id, e.target.value)}
                                placeholder="输入归类说明..."
                                disabled={selectedQuarter.status === 'completed'}
                                className="w-full px-2.5 py-1 rounded border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white/90"
                              />
                            </td>

                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              {t.status === 'receipt_matched' && (
                                <span
                                  onClick={() => {
                                    if (t.matchedReceiptId) {
                                      const r = receipts.find(rc => rc.id === t.matchedReceiptId);
                                      if (r) { setSelectedReceipt(r); }
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-pointer hover:underline"
                                >
                                  <ReceiptIcon size={12} /> 小票已配对
                                  <ExternalLink size={10} />
                                </span>
                              )}
                              {t.status === 'rule_matched' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                  规则配对
                                </span>
                              )}
                              {t.status === 'uncategorized' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-200 text-amber-900 border border-amber-400">
                                  未分类
                                </span>
                              )}
                              {t.status === 'completed' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-300">
                                  已完成
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3 text-center whitespace-nowrap">
                              {selectedQuarter.status !== 'completed' && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTransaction(t.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="删除该笔账目"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Quarters Summary Cards View */
            <div className="space-y-5">
              {/* Business Entity Switcher Bar */}
              <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">当前商业主体 (Business Entity)</h3>
                    <p className="text-[11px] text-slate-400">切换主体以查看其名下独立的季度账本及财务流水</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(businesses.length > 0 ? businesses : DEFAULT_BUSINESSES).map((biz) => {
                    const isSelected = selectedBusiness === biz.name;
                    return (
                      <button
                        key={biz.id || biz.code || biz.name}
                        type="button"
                        onClick={() => handleSelectBusiness(biz.name)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
                          isSelected
                            ? 'bg-slate-900 text-amber-400 border border-slate-800 shadow-md ring-2 ring-amber-400/50'
                            : 'bg-slate-50 text-slate-600 hover:bg-amber-50 hover:text-amber-900 border border-slate-200'
                        }`}
                      >
                        <span>{biz.name}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400"></span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span>{selectedBusiness}</span>
                  <span className="text-slate-400 text-sm font-normal">季度账本列表</span>
                </h2>
                <span className="text-xs text-slate-500">点击季度卡片进入账本交易列表</span>
              </div>

              {quarters.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
                  <FileSpreadsheet size={48} className="mx-auto text-slate-300" />
                  <h3 className="text-base font-bold text-slate-700">暂无【{selectedBusiness}】的季度账本数据</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    请点击右上角「上传银行 CSV 账单」导入该商业主体的银行流水生成季度账本。
                  </p>
                  <button
                    onClick={() => {
                      setUploadBusiness(selectedBusiness);
                      setShowCsvModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition"
                  >
                    <Upload size={16} /> 上传银行 CSV
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {quarters.map((q) => (
                    <div
                      key={q.id}
                      onClick={() => loadQuarterTransactions(q)}
                      className="group bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-amber-400/80 transition cursor-pointer relative overflow-hidden flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-extrabold text-slate-800 group-hover:text-amber-600 transition">
                              {q.yearQuarter}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {q.business || selectedBusiness}
                            </span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            q.status === 'completed' ? 'bg-slate-100 text-slate-700 border border-slate-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {q.status === 'completed' ? '已完成' : '草稿中'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-slate-400 block text-[10px]">交易笔数</span>
                            <span className="font-bold text-slate-700 text-sm">{q.totalTransactions} 笔</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">总收支金额</span>
                            <span className={`font-bold text-sm ${q.totalAmount < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                              {q.totalAmount < 0 ? `-$${Math.abs(q.totalAmount).toFixed(2)}` : `+$${q.totalAmount.toFixed(2)}`}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">GST 净税额</span>
                            <span className={`font-bold text-sm ${q.totalGst < 0 ? 'text-red-600' : q.totalGst > 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
                              {q.totalGst < 0 ? `-$${Math.abs(q.totalGst).toFixed(2)}` : q.totalGst > 0 ? `+$${q.totalGst.toFixed(2)}` : '$0.00'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">小票匹配成功</span>
                            <span className="font-bold text-blue-600 text-sm">{q.receiptMatchedCount} 笔</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-amber-600 font-semibold group-hover:translate-x-1 transition">
                          <span>查看该季度明细</span>
                          <ChevronRight size={16} />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteQuarter(q.id, q.yearQuarter, e)}
                          className="p-1 text-slate-300 hover:text-red-600 rounded transition"
                          title={`删除季度 ${q.yearQuarter}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* TAB 2: RECEIPTS POOL */}
      {activeTab === 'receipts' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ReceiptIcon className="text-amber-500" size={20} />
                小票与 Tax Invoice 智能提取库
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                支持拍照/PDF 上传至 Cloudflare R2，调用 Azure Document Intelligence OCR 提取金额与 GST。
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setReceiptFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${receiptFilter === 'all' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                >
                  全部 ({receipts.length})
                </button>
                <button
                  onClick={() => setReceiptFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg transition ${receiptFilter === 'pending' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                >
                  待匹配 ({receipts.filter(r => r.status === 'pending').length})
                </button>
                <button
                  onClick={() => setReceiptFilter('matched')}
                  className={`px-3 py-1.5 rounded-lg transition ${receiptFilter === 'matched' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                >
                  已匹配 ({receipts.filter(r => r.status === 'matched').length})
                </button>
              </div>

              <label className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition shadow-md shadow-amber-500/20 cursor-pointer">
                <Upload size={16} />
                {uploading ? 'OCR 识别中...' : '上传小票/PDF'}
                <input type="file" accept="image/*,application/pdf" onChange={handleReceiptUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Receipts Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {receipts.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  {/* File preview or icon */}
                  <div className="h-40 bg-slate-100 border-b border-slate-100 relative overflow-hidden flex items-center justify-center">
                    {r.r2Url && (r.r2Key.endsWith('.jpg') || r.r2Key.endsWith('.png') || r.r2Key.endsWith('.jpeg') || r.r2Key.endsWith('.webp')) ? (
                      <img src={r.r2Url} alt="Receipt" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4 text-slate-400">
                        <ReceiptIcon size={36} className="mx-auto mb-1 text-slate-300" />
                        <span className="text-[10px] font-mono block">{r.r2Key.split('/').pop()}</span>
                      </div>
                    )}

                    <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === 'matched' ? 'bg-emerald-500 text-white shadow' : 'bg-amber-500 text-white shadow'
                    }`}>
                      {r.status === 'matched' ? '已匹配关联' : '待匹配 (Pending)'}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-slate-800 truncate" title={r.merchantName || '未知商户'}>
                      {r.merchantName || '未知商户 (Merchant)'}
                    </h3>
                    <div className="text-xs text-slate-500 flex items-center justify-between">
                      <span>交易日期：</span>
                      <span className="font-medium">{r.transactionDate ? new Date(r.transactionDate).toLocaleDateString('en-AU') : '未提取'}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center justify-between">
                      <span>小票总金额：</span>
                      <span className="font-bold text-slate-800 text-sm">${r.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center justify-between">
                      <span>GST 税额：</span>
                      <span className="font-bold text-emerald-600">${r.gstAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {r.r2Url ? (
                      <a
                        href={r.r2Url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-amber-600 hover:underline inline-flex items-center gap-1"
                      >
                        查看原图 <ExternalLink size={12} />
                      </a>
                    ) : <span>-</span>}

                    <button
                      onClick={() => openReceiptEditModal(r)}
                      className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1 ml-2"
                      title="手动补录/修改商户与金额"
                    >
                      <Edit3 size={12} /> 补录/编辑
                    </button>
                  </div>

                  <button
                    onClick={async () => {
                      if (confirm('确定删除该小票吗？')) {
                        await receiptsApi.delete(r.id);
                        await loadReceipts();
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RULES LIBRARY */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Tag className="text-amber-500" size={20} />
                账本自动分类规则库 (Ledger Rules Engine)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                所有商业主体共享统一规则库 · 包含匹配银行流水 Description 自动填充归类说明
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Rules Search Box */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索关键字或说明..."
                  value={ruleSearchTerm}
                  onChange={(e) => setRuleSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 w-44 md:w-56"
                />
                {ruleSearchTerm && (
                  <button
                    onClick={() => setRuleSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={loadRules}
                disabled={loadingRules}
                title="刷新规则库"
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition"
              >
                <RefreshCw size={15} className={loadingRules ? 'animate-spin text-amber-500' : ''} />
              </button>

              {/* Add Rule Button */}
              <button
                onClick={handleOpenAddRule}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition shadow-md shadow-amber-500/20"
              >
                <Plus size={15} />
                添加新分类规则
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                {ruleSearchTerm ? `匹配到 ${filteredRules.length} 条` : `共 ${rules.length} 条分类规则`}
                {ruleSearchTerm && ` (全库共 ${rules.length} 条)`}
              </span>
              <span className="text-[11px] text-slate-400">导入 CSV 时系统优先匹配更长的关键字</span>
            </div>

            {loadingRules && rules.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <RefreshCw size={24} className="animate-spin mx-auto text-amber-500" />
                <p className="text-xs">正在载入分类规则库...</p>
              </div>
            ) : filteredRules.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <Tag size={32} className="mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">
                  {ruleSearchTerm ? `未找到匹配 “${ruleSearchTerm}” 的规则` : '规则库暂无数据'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {ruleSearchTerm
                    ? '请尝试其他搜索词或清除搜索框。'
                    : '可点击右上角「导入历史 Excel 学习规则」自动提取，或点击「添加新分类规则」手动录入。'}
                </p>
                {ruleSearchTerm ? (
                  <button
                    onClick={() => setRuleSearchTerm('')}
                    className="px-3 py-1.5 rounded-xl text-xs bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    清除搜索
                  </button>
                ) : (
                  <button
                    onClick={handleOpenAddRule}
                    className="px-3 py-1.5 rounded-xl text-xs bg-amber-500 text-white hover:bg-amber-600"
                  >
                    新建第一条规则
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4 w-1/3">匹配关键字 (KEYWORD)</th>
                    <th className="py-3 px-4 w-1/3">归类说明 (CATEGORY / NOTES)</th>
                    <th className="py-3 px-4 w-1/6">创建时间</th>
                    <th className="py-3 px-4 text-right w-1/6">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRules.map((r) => (
                    <tr key={r.id} className="hover:bg-amber-50/30 transition group">
                      <td className="py-3 px-4 font-mono font-bold text-amber-900">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-100/70 text-amber-800 border border-amber-200/80">
                          {r.keyword}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {r.categoryNote}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(r.createdAt).toLocaleDateString('en-AU')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditRule(r)}
                            title="修改该规则"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition"
                          >
                            <Edit3 size={13} />
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteRule(r.id, r.keyword)}
                            title="删除该规则"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition"
                          >
                            <Trash2 size={13} />
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800">上传银行 CSV 账单生成账本</h3>
            <p className="text-xs text-slate-500">
              请选择 4 列格式银行 CSV（Date, Amount, Description, Balance），系统将自动判断季度、自动规则分类并配对小票。
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                选择归属主体 (Business Entity)
              </label>
              <select
                value={uploadBusiness}
                onChange={(e) => setUploadBusiness(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {(businesses.length > 0 ? businesses : DEFAULT_BUSINESSES).map((b) => (
                  <option key={b.id || b.code || b.name} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="border-2 border-dashed border-amber-300 bg-amber-50/50 p-8 rounded-xl text-center space-y-2">
              <Upload size={32} className="mx-auto text-amber-500" />
              <label className="block text-xs font-bold text-amber-700 cursor-pointer">
                {uploading ? '上传解析中...' : '点击选择 CSV 文件'}
                <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Excel Learning Modal */}
      {showExcelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800">导入历史 Excel 学习规则引擎</h3>
            <p className="text-xs text-slate-500">
              上传包含 6 列的 Excel 历史账本（DATE, AMOUNT, GST, BANK DESCRIPTION, BALANCE, 说明），系统将提炼 Description 关键字存入规则库。
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                选择归属主体 (Business Entity)
              </label>
              <select
                value={uploadBusiness}
                onChange={(e) => setUploadBusiness(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {(businesses.length > 0 ? businesses : DEFAULT_BUSINESSES).map((b) => (
                  <option key={b.id || b.code || b.name} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="border-2 border-dashed border-amber-300 bg-amber-50/50 p-8 rounded-xl text-center space-y-2">
              <Sparkles size={32} className="mx-auto text-amber-500" />
              <label className="block text-xs font-bold text-amber-700 cursor-pointer">
                {uploading ? '解析学习中...' : '点击选择 .xlsx 文件'}
                <input type="file" accept=".xlsx,.xls" onChange={handleExcelHistoryUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowExcelModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveRule} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {editingRule ? '编辑分类规则' : '添加新分类规则'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {editingRule
                  ? '修改关键字或其对应的归类说明，所有主体的账本在导入时均共用此规则。'
                  : '添加关键字与归类说明，所有主体的银行流水账单导入时将自动匹配并填充。'}
              </p>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  匹配关键字 (Keyword, e.g. 7-ELEVEN, PAYROLLER)
                </label>
                <input
                  type="text"
                  required
                  value={ruleKeyword}
                  onChange={(e) => setRuleKeyword(e.target.value)}
                  placeholder="输入银行 Description 中的关键字"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-medium text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  归类说明 (Category / Notes, e.g. Fuel, 发薪手续费)
                </label>
                <input
                  type="text"
                  required
                  value={ruleCategory}
                  onChange={(e) => setRuleCategory(e.target.value)}
                  placeholder="输入匹配后填充的说明"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowRuleModal(false);
                  setEditingRule(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
              >
                {editingRule ? '保存修改' : '确认添加'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Selected Receipt Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
              关联小票详情 ({selectedReceipt.merchantName || '未知商户'})
            </h3>

            {selectedReceipt.r2Url ? (
              <div className="max-h-80 overflow-auto border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center">
                <img src={selectedReceipt.r2Url} alt="Receipt Preview" className="max-w-full max-h-72 object-contain" />
              </div>
            ) : (
              <p className="text-xs text-slate-400">无可用的预览图像。</p>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl">
              <div>
                <span className="text-slate-400 block text-[10px]">商户名称</span>
                <span className="font-bold text-slate-800">{selectedReceipt.merchantName || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">交易日期</span>
                <span className="font-bold text-slate-800">{selectedReceipt.transactionDate ? new Date(selectedReceipt.transactionDate).toLocaleDateString('en-AU') : '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">总金额</span>
                <span className="font-bold text-slate-800">${selectedReceipt.totalAmount.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">GST 税额</span>
                <span className="font-bold text-emerald-600">${selectedReceipt.gstAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900"
              >
                关闭预览
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editing Receipt Modal */}
      {editingReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Edit3 size={18} className="text-amber-500" />
              补录 / 编辑小票识别信息
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">商户名称 (Merchant)</label>
                <input
                  type="text"
                  value={editMerchant}
                  onChange={(e) => setEditMerchant(e.target.value)}
                  placeholder="例如：Bunnings, 7-Eleven, Officeworks"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">交易日期 (Date)</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">小票总金额 ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editTotal}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditTotal(val);
                      // If GST is empty or 0, provide quick auto calculation
                      const num = parseFloat(val);
                      if (!isNaN(num) && num > 0 && (!editGst || editGst === '0')) {
                        setEditGst((Math.round((num / 11) * 100) / 100).toFixed(2));
                      }
                    }}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-600 font-semibold">GST 税额 ($)</label>
                    <button
                      type="button"
                      onClick={() => {
                        const num = parseFloat(editTotal);
                        if (!isNaN(num) && num > 0) {
                          setEditGst((Math.round((num / 11) * 100) / 100).toFixed(2));
                        }
                      }}
                      className="text-[10px] text-amber-600 hover:underline font-bold"
                    >
                      ÷11 计算
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={editGst}
                    onChange={(e) => setEditGst(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                💡 完善商户、金额与日期后，系统可在季度账本中自动匹配对应的银行支出记录并补全 GST。
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingReceipt(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveReceiptEdit}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/20"
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
