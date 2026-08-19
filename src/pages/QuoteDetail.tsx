import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { 
  ArrowLeft, User, MapPin, Home, Calendar, MessageSquare, 
  ChevronDown, ChevronUp, Image as ImageIcon, Briefcase,
  Edit3, Save, X, FileText, Activity
} from 'lucide-react';

interface QuoteNoteDto {
  id: string;
  note: string;
  createdByName?: string;
  createdAt: string;
}

interface QuoteTimelineDto {
  id: string;
  eventType: string;
  eventTitle: string;
  eventDescription?: string;
  oldValue?: string;
  newValue?: string;
  createdByName?: string;
  createdAt: string;
}

interface QuoteDetailData {
  id: string;
  quoteNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  propertyAddress: string | null;
  suburb: string | null;
  postcode: string | null;
  propertyType: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  livingAreas: number | null;
  kitchens: number | null;
  hasPets: boolean | null;
  parkingAvailable: boolean | null;
  preferredDate: string | null;
  customerMessage: string | null;
  websiteEstimateAmount: number | null;
  reviewedAmount: number | null;
  status: string;
  createdAt: string;
  source: {
    leadSourceName: string | null;
    qrCampaignName: string | null;
  };
  services: Array<{
    serviceCode: string;
    serviceName: string;
    quantity: number | null;
    unit: string | null;
    estimatedAmount: number | null;
  }>;
  photos: Array<{
    id: string;
    fileName: string;
    fileUrl: string | null;
    uploadedAt: string;
  }>;
}

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = true }: { title: string, icon: any, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gray-50/80 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Icon className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      {isOpen && (
        <div className="px-6 py-5 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

export default function QuoteDetail() {
  const { id } = useParams();
  const [data, setData] = useState<QuoteDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [notes, setNotes] = useState<QuoteNoteDto[]>([]);
  const [timeline, setTimeline] = useState<QuoteTimelineDto[]>([]);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Review actions state
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewAmountInput, setReviewAmountInput] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusInput, setStatusInput] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  const handleSaveReviewAmount = async () => {
    if (!reviewAmountInput) return;
    setSavingReview(true);
    setActionMessage({ type: '', text: '' });
    try {
      const response = await apiClient.patch(`/biz/quotes/${id}/review`, {
        reviewedAmount: parseFloat(reviewAmountInput)
      });
      if (response.data?.success) {
        setData(prev => prev ? { ...prev, reviewedAmount: parseFloat(reviewAmountInput) } : prev);
        setIsEditingReview(false);
        setActionMessage({ type: 'success', text: 'Reviewed amount updated successfully.' });
        refreshTimeline();
      } else {
        setActionMessage({ type: 'error', text: response.data?.message || 'Failed to update amount.' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'An error occurred.' });
    } finally {
      setSavingReview(false);
      setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleSaveStatus = async () => {
    if (!statusInput) return;
    setSavingStatus(true);
    setActionMessage({ type: '', text: '' });
    try {
      const response = await apiClient.patch(`/biz/quotes/${id}/status`, {
        status: statusInput
      });
      if (response.data?.success) {
        setData(prev => prev ? { ...prev, status: statusInput } : prev);
        setIsEditingStatus(false);
        setActionMessage({ type: 'success', text: 'Status updated successfully.' });
        refreshTimeline();
      } else {
        setActionMessage({ type: 'error', text: response.data?.message || 'Failed to update status.' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'An error occurred.' });
    } finally {
      setSavingStatus(false);
      setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
    }
  };

  const refreshTimeline = async () => {
    try {
      const timelineRes = await apiClient.get(`/biz/quotes/${id}/timeline`);
      if (timelineRes.data?.success) setTimeline(timelineRes.data.data);
    } catch (e) {}
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);
    try {
      const response = await apiClient.post(`/biz/quotes/${id}/notes`, {
        note: newNote.trim()
      });
      if (response.data?.success) {
        setNewNote('');
        const [notesRes, timelineRes] = await Promise.all([
          apiClient.get(`/biz/quotes/${id}/notes`),
          apiClient.get(`/biz/quotes/${id}/timeline`)
        ]);
        if (notesRes.data?.success) setNotes(notesRes.data.data);
        if (timelineRes.data?.success) setTimeline(timelineRes.data.data);
      }
    } catch (err) {
      console.error('Failed to add note', err);
    } finally {
      setSavingNote(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [detailRes, notesRes, timelineRes] = await Promise.all([
          apiClient.get(`/biz/quotes/${id}`),
          apiClient.get(`/biz/quotes/${id}/notes`),
          apiClient.get(`/biz/quotes/${id}/timeline`)
        ]);

        if (detailRes.data?.success) {
          setData(detailRes.data.data);
        } else {
          setError('Failed to load quote details.');
        }

        if (notesRes.data?.success) {
          setNotes(notesRes.data.data);
        }
        
        if (timelineRes.data?.success) {
          setTimeline(timelineRes.data.data);
        }
      } catch (err) {
        setError('An error occurred while loading quote details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
        <Link to="/quotes" className="mt-2 inline-flex items-center text-sm font-medium text-red-700 hover:text-red-600">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Quotes
        </Link>
      </div>
    );
  }

  const statusStyles: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800 border-blue-200',
    reviewing: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link to="/quotes" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{data.quoteNumber}</h1>
            <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusStyles[data.status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
              {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
            </span>
          </div>
          <p className="text-gray-500 ml-11">Submitted on {new Date(data.createdAt).toLocaleString()}</p>
        </div>
        
        <div className="flex items-center gap-3 ml-11 sm:ml-0 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <div className="text-center px-4">
            <p className="text-xs font-semibold text-gray-500 uppercase">System Estimate</p>
            <p className="text-xl font-bold text-gray-900">{data.websiteEstimateAmount ? `$${data.websiteEstimateAmount.toLocaleString()}` : 'N/A'}</p>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-center px-4">
            <p className="text-xs font-semibold text-gray-500 uppercase">Reviewed Amount</p>
            <p className="text-xl font-bold text-indigo-600">{data.reviewedAmount ? `$${data.reviewedAmount.toLocaleString()}` : 'Pending'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CollapsibleSection title="Customer Information" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="mt-1 text-base text-gray-900 font-medium">{data.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone Number</p>
                <p className="mt-1 text-base text-gray-900 font-medium">{data.customerPhone}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                <p className="mt-1 text-base text-gray-900">{data.customerEmail || 'Not provided'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-gray-500">Source</p>
                <p className="mt-1 text-sm text-gray-700 bg-gray-50 inline-block px-3 py-1 rounded-md border border-gray-200">
                  {data.source.leadSourceName || 'Direct'} {data.source.qrCampaignName ? `(${data.source.qrCampaignName})` : ''}
                </p>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Property Details" icon={Home}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6 mb-6">
              <div className="sm:col-span-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Full Address</p>
                    <p className="mt-1 text-base text-gray-900">
                      {data.propertyAddress || 'Not provided'}<br />
                      {data.suburb} {data.postcode}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm font-medium text-gray-500">Property Type</p>
                <p className="mt-1 text-base font-semibold text-gray-900">{data.propertyType || 'N/A'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                  <p className="text-sm font-medium text-gray-500">Bedrooms</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{data.bedrooms || 0}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                  <p className="text-sm font-medium text-gray-500">Bathrooms</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{data.bathrooms || 0}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                  <p className="text-sm font-medium text-gray-500">Living Areas</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{data.livingAreas || 0}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                  <p className="text-sm font-medium text-gray-500">Kitchens</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{data.kitchens || 0}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${data.hasPets ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm font-medium text-gray-700">{data.hasPets ? 'Has Pets' : 'No Pets'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${data.parkingAvailable ? 'bg-indigo-500' : 'bg-gray-300'}`}></div>
                <span className="text-sm font-medium text-gray-700">{data.parkingAvailable ? 'Parking Available' : 'No Parking'}</span>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Requested Services" icon={Briefcase}>
            {data.services.length === 0 ? (
              <p className="text-gray-500">No specific services requested.</p>
            ) : (
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Est. Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.services.map((service, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{service.serviceName}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 text-right">
                          {service.quantity ? `${service.quantity} ${service.unit || ''}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                          {service.estimatedAmount ? `$${service.estimatedAmount.toLocaleString()}` : '-'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold">
                      <td colSpan={2} className="px-4 py-3 text-right text-sm text-gray-900">Total System Estimate:</td>
                      <td className="px-4 py-3 text-right text-sm text-indigo-600">
                        {data.websiteEstimateAmount ? `$${data.websiteEstimateAmount.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CollapsibleSection>

          <CollapsibleSection title="Internal Notes" icon={FileText} defaultOpen={true}>
            <div className="mb-6">
              <label htmlFor="new-note" className="sr-only">Add a note</label>
              <textarea
                id="new-note"
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border outline-none resize-none"
                placeholder="Type an internal note here..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                disabled={savingNote}
              ></textarea>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleAddNote}
                  disabled={savingNote || !newNote.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {savingNote ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {notes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-100 rounded-lg">No notes yet.</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="bg-amber-50/50 border border-amber-100 rounded-lg p-4">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.note}</p>
                    <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-amber-100">
                      {new Date(note.createdAt).toLocaleString()} {note.createdByName ? `• ${note.createdByName}` : ''}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CollapsibleSection>
        </div>

        <div className="space-y-6">
          <CollapsibleSection title="Admin Actions" icon={Edit3} defaultOpen={true}>
            {actionMessage.text && (
              <div className={`p-3 rounded-md mb-4 text-sm font-medium ${actionMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {actionMessage.text}
              </div>
            )}
            
            <div className="space-y-5">
              {/* Status Update */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Quote Status</p>
                {isEditingStatus ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border bg-white outline-none"
                      disabled={savingStatus}
                    >
                      <option value="new">New</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button onClick={handleSaveStatus} disabled={savingStatus} className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsEditingStatus(false)} disabled={savingStatus} className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[data.status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                      {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                    </span>
                    <button 
                      onClick={() => { setStatusInput(data.status); setIsEditingStatus(true); }}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Change Status
                    </button>
                  </div>
                )}
              </div>

              {/* Reviewed Amount */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Reviewed Amount ($)</p>
                {isEditingReview ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={reviewAmountInput}
                      onChange={(e) => setReviewAmountInput(e.target.value)}
                      placeholder="e.g. 1500"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border outline-none"
                      disabled={savingReview}
                    />
                    <button onClick={handleSaveReviewAmount} disabled={savingReview} className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsEditingReview(false)} disabled={savingReview} className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="font-semibold text-gray-900">
                      {data.reviewedAmount ? `$${data.reviewedAmount.toLocaleString()}` : 'Not set'}
                    </span>
                    <button 
                      onClick={() => { setReviewAmountInput(data.reviewedAmount?.toString() || ''); setIsEditingReview(true); }}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Update Amount
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Additional Info" icon={Calendar} defaultOpen={true}>
            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Preferred Date
                </p>
                <p className="mt-1.5 text-base font-semibold text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {data.preferredDate ? new Date(data.preferredDate).toLocaleDateString() : 'Flexible'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4" /> Customer Message
                </p>
                <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap italic">
                    {data.customerMessage ? `"${data.customerMessage}"` : 'No additional message provided.'}
                  </p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Photos" icon={ImageIcon} defaultOpen={true}>
            {data.photos.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                <ImageIcon className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No photos uploaded.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {data.photos.map(photo => (
                  <a 
                    key={photo.id} 
                    href={photo.fileUrl || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group block relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
                  >
                    {photo.fileUrl ? (
                      <img src={photo.fileUrl} alt={photo.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500 text-center px-2 truncate w-full">{photo.fileName}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  </a>
                ))}
              </div>
            )}
          </CollapsibleSection>

          <CollapsibleSection title="Timeline" icon={Activity} defaultOpen={true}>
            <div className="relative pl-4 border-l-2 border-indigo-100 space-y-6 pb-2">
              {timeline.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No timeline events yet.</p>
              ) : (
                timeline.map((event) => (
                  <div key={event.id} className="relative">
                    <div className="absolute -left-6 bg-white p-1 rounded-full border-2 border-indigo-200">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{event.eventTitle}</p>
                      {event.eventDescription && <p className="text-sm text-gray-600 mt-1">{event.eventDescription}</p>}
                      {(event.oldValue || event.newValue) && (
                        <div className="mt-2 text-xs bg-gray-50 p-2 rounded border border-gray-100 text-gray-600 font-mono">
                          {event.oldValue && <span className="line-through text-red-500 mr-2">{event.oldValue}</span>}
                          {event.newValue && <span className="text-green-600">{event.newValue}</span>}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(event.createdAt).toLocaleString()} {event.createdByName ? `• ${event.createdByName}` : ''}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}
