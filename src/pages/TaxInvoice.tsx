import { useState, useEffect } from 'react';
import { clientApi, type Client } from '../lib/clientApi';
import { taxInvoiceApi } from '../lib/taxInvoiceApi';
import type { TaxInvoicePreviewDto, BusinessEntityDto } from '../types/taxInvoice';
import { TaxInvoicePreviewTable } from '../components/TaxInvoice/TaxInvoicePreviewTable';
import { FileText, Loader2, Mail, Send, X } from 'lucide-react';

export default function TaxInvoice() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [periodStart, setPeriodStart] = useState<string>('');
  const [periodEnd, setPeriodEnd] = useState<string>('');
  
  const [businesses, setBusinesses] = useState<BusinessEntityDto[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  
  const [preview, setPreview] = useState<TaxInvoicePreviewDto | null>(null);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Send Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailPdfType, setEmailPdfType] = useState<'Full' | 'Simple' | 'DetailsOnly'>('Full');
  const [targetEmailsInput, setTargetEmailsInput] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoadingBusinesses(true);
      const data = await taxInvoiceApi.getBusinesses();
      setBusinesses(data);
      if (data.length > 0) {
        setSelectedBusinessId(data[0].id);
      }
    } catch (err) {
      setError('Failed to load businesses');
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const data = await clientApi.getClients();
      setClients(data);
    } catch (err) {
      setError('Failed to load clients');
    } finally {
      setLoadingClients(false);
    }
  };

  const handleGeneratePreview = async () => {
    if (!selectedClientId || !periodStart || !periodEnd) {
      setError('Please select a client and date range.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setGenerating(true);
    setPreview(null);
    try {
      const data = await taxInvoiceApi.generatePreview({
        clientId: selectedClientId,
        periodStart: new Date(periodStart).toISOString(),
        periodEnd: new Date(periodEnd).toISOString()
      });
      setPreview(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate preview');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = async (pdfType: 'Full' | 'Simple' | 'DetailsOnly' = 'Full') => {
    if (!preview || preview.items.length === 0) {
      alert("No breakdown items available to generate PDF.");
      return;
    }
    
    const business = businesses.find(b => b.id === selectedBusinessId);
    if (!business) {
      alert("Please select a business.");
      return;
    }

    try {
      setGenerating(true);
      setError('');
      
      const requestDto = {
        invoiceNo: `INV-${new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14)}`,
        issueDate: new Date().toLocaleDateString(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        preview: preview,
        business: business,
        pdfType: pdfType
      };

      const blob = await taxInvoiceApi.downloadPdf(requestDto);
      
      let suffix = '';
      if (pdfType === 'Simple') suffix = '_Simple';
      if (pdfType === 'DetailsOnly') suffix = '_Details';

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TaxInvoice_${preview.clientName.replace(/\s+/g, '_')}_${preview.periodStart.slice(0, 10)}_to_${preview.periodEnd.slice(0, 10)}${suffix}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Failed to download PDF');
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenEmailModal = () => {
    if (!preview || preview.items.length === 0) return;
    setTargetEmailsInput(preview.clientEmail || '');
    setEmailPdfType('Full');
    setIsEmailModalOpen(true);
  };

  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) return;

    const business = businesses.find(b => b.id === selectedBusinessId);
    if (!business) {
      alert("Please select a business.");
      return;
    }

    setSendingEmail(true);
    setError('');
    setSuccessMsg('');

    try {
      const pdfRequest = {
        invoiceNo: `INV-${new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14)}`,
        issueDate: new Date().toLocaleDateString(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        preview: preview,
        business: business,
        pdfType: emailPdfType
      };

      const res = await taxInvoiceApi.sendEmail({
        pdfRequest,
        targetEmails: targetEmailsInput
      });

      setSuccessMsg(`${res.message} (R2 Backup: ${res.r2Path})`);
      setIsEmailModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">
      <div className="flex items-center mb-6">
        <FileText className="text-primary mr-2" size={28} />
        <h1 className="text-2xl font-bold text-gray-900">Tax Invoice Generator</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-200">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6 text-sm border border-green-200">
          {successMsg}
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow border border-border mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Business</label>
            {loadingBusinesses ? (
              <div className="text-sm text-gray-500">Loading businesses...</div>
            ) : (
              <select
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
                className="w-full border rounded-md p-2 focus:border-primary focus:outline-none bg-white text-gray-900"
              >
                <option value="">-- Select Business --</option>
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Client</label>
            {loadingClients ? (
              <div className="text-sm text-gray-500">Loading clients...</div>
            ) : (
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full border rounded-md p-2 focus:border-primary focus:outline-none bg-white text-gray-900"
              >
                <option value="">-- Select Client --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period Start</label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="w-full border rounded-md p-2 focus:border-primary focus:outline-none text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period End</label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="w-full border rounded-md p-2 focus:border-primary focus:outline-none text-gray-900"
            />
          </div>
        </div>

        <button
          onClick={handleGeneratePreview}
          disabled={generating || !selectedClientId || !selectedBusinessId || !periodStart || !periodEnd}
          className="w-full bg-primary text-white py-2.5 rounded-md hover:bg-red-600 transition disabled:opacity-50 flex justify-center items-center font-medium mt-2"
        >
          {generating ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Generating Preview...
            </>
          ) : (
            'Generate Preview'
          )}
        </button>
      </div>

      {preview && (
        <div className="animate-fade-in">
          <TaxInvoicePreviewTable preview={preview} onUpdatePreview={setPreview} />
          
          <div className="mt-6 flex flex-wrap gap-4">
            <button 
              onClick={handleOpenEmailModal}
              disabled={generating || !preview || preview.items.length === 0}
              className="flex-1 bg-green-600 text-white py-2.5 rounded-md hover:bg-green-700 transition font-medium disabled:opacity-50 flex justify-center items-center min-w-[140px] shadow"
            >
              <Mail className="mr-2" size={18} />
              Send Email
            </button>
            <button 
              onClick={() => handleDownloadPdf('Full')}
              disabled={generating || !preview || preview.items.length === 0}
              className="flex-1 bg-primary text-white py-2.5 rounded-md hover:bg-red-600 transition font-medium disabled:opacity-50 flex justify-center items-center min-w-[140px]"
            >
              {generating ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Download Full
            </button>
            <button 
              onClick={() => handleDownloadPdf('Simple')}
              disabled={generating || !preview || preview.items.length === 0}
              className="flex-1 bg-primary text-white py-2.5 rounded-md hover:bg-red-600 transition font-medium disabled:opacity-50 flex justify-center items-center min-w-[140px]"
            >
              {generating ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Download Simple
            </button>
            <button 
              onClick={() => handleDownloadPdf('DetailsOnly')}
              disabled={generating || !preview || preview.items.length === 0}
              className="flex-1 bg-primary text-white py-2.5 rounded-md hover:bg-red-600 transition font-medium disabled:opacity-50 flex justify-center items-center min-w-[140px]"
            >
              {generating ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Download Details
            </button>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden text-gray-900 shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold flex items-center">
                <Mail className="mr-2 text-primary" size={20} />
                Send Tax Invoice via Email
              </h2>
              <button onClick={() => setIsEmailModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSendEmailSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Email(s) *
                </label>
                <input 
                  type="text" 
                  required
                  value={targetEmailsInput}
                  onChange={e => setTargetEmailsInput(e.target.value)}
                  placeholder="e.g. primary@abc.com, cc@abc.com"
                  className="w-full border rounded-md p-2 focus:border-primary focus:outline-none text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  多个邮箱可用逗号 `,` 分隔。第一个作为主收件人(To)，后面的作为抄送(CC)。
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PDF Attachment Format *
                </label>
                <select
                  value={emailPdfType}
                  onChange={e => setEmailPdfType(e.target.value as any)}
                  className="w-full border rounded-md p-2 focus:border-primary focus:outline-none text-sm bg-white"
                >
                  <option value="Full">Full (Summary + Attachment Breakdown)</option>
                  <option value="Simple">Simple (Summary Only)</option>
                  <option value="DetailsOnly">Details Only (Breakdown Table Only)</option>
                </select>
              </div>

              <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-xs text-blue-700">
                发送成功后，发票 PDF 文件将同步自动备份至 Cloudflare R2 存储桶。
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium flex items-center"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Sending & Backing up...
                    </>
                  ) : (
                    <>
                      <Send className="mr-1.5" size={16} />
                      Send & Backup
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
