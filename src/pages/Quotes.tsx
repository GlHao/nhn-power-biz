import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Search, Filter, ChevronLeft, ChevronRight, FileText, Sparkles } from 'lucide-react';

interface Quote {
  id: string;
  quoteNumber: string;
  customerName: string;
  suburb: string | null;
  status: string;
  createdAt: string;
  websiteEstimateAmount: number | null;
  leadSourceName?: string | null;
}

export default function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await apiClient.get('/biz/quotes');
        if (response.data?.success) {
          setQuotes(response.data.data || []);
        } else {
          setError('Failed to load quotes data.');
        }
      } catch (err) {
        setError('An error occurred while loading the quotes.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const statusStyles: Record<string, string> = {
    new: 'bg-gradient-to-r from-red-50 to-amber-50 text-red-700 border-red-300 font-semibold shadow-xs',
    reviewing: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
    approved: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
    rejected: 'bg-rose-50 text-rose-800 border-rose-300 font-semibold',
    closed: 'bg-gray-50 text-gray-700 border-gray-300',
  };

  const allStatuses = useMemo(() => {
    const statuses = new Set(quotes.map(q => q.status.toLowerCase()));
    return ['all', ...Array.from(statuses)];
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    return quotes.filter(quote => {
      const matchesSearch = 
        quote.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (quote.suburb && quote.suburb.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || quote.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quotes, searchQuery, statusFilter]);

  const paginatedQuotes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredQuotes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQuotes, currentPage]);

  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage) || 1;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-red-600"></div>
          <Sparkles className="absolute h-5 w-5 text-amber-500 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error && quotes.length === 0) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-6 shadow-sm">
        <p className="text-sm font-medium text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl shadow-cny border border-amber-200/60">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="w-3 h-6 bg-red-600 rounded-full inline-block"></span>
            Quotes List
          </h1>
          <p className="text-xs text-gray-500 mt-1">Manage and track customer quote applications</p>
        </div>
        
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-amber-600" />
            </div>
            <input
              type="text"
              className="block w-full rounded-xl border border-amber-200/80 bg-amber-50/20 py-2.5 pl-10 pr-3 text-xs font-medium placeholder-gray-400 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              placeholder="Search by quote #, name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Filter className="h-4 w-4 text-amber-600" />
            </div>
            <select
              className="block w-full rounded-xl border border-amber-200/80 bg-amber-50/20 py-2.5 pl-10 pr-8 text-xs font-semibold text-gray-700 focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 appearance-none transition-all cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {allStatuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl shadow-cny border border-amber-200/60 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-amber-100/60">
            <thead className="bg-amber-50/40">
              <tr className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                <th scope="col" className="px-6 py-4 text-left">Quote ID</th>
                <th scope="col" className="px-6 py-4 text-left">Customer</th>
                <th scope="col" className="px-6 py-4 text-left">Source</th>
                <th scope="col" className="px-6 py-4 text-left">Suburb</th>
                <th scope="col" className="px-6 py-4 text-left">Status</th>
                <th scope="col" className="px-6 py-4 text-left">Est. Amount</th>
                <th scope="col" className="px-6 py-4 text-left">Date</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-amber-100/40">
              {paginatedQuotes.length > 0 ? (
                paginatedQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-amber-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-900 group-hover:text-red-600 transition-colors">
                      {quote.quoteNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {quote.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md font-medium border ${
                        quote.leadSourceName?.includes('Auntie')
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : quote.leadSourceName?.includes('NHN')
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {quote.leadSourceName || 'Direct'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quote.suburb || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${statusStyles[quote.status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-amber-800">
                      {quote.websiteEstimateAmount ? `$${quote.websiteEstimateAmount.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                      <Link
                        to={`/quotes/${quote.id}`}
                        className="inline-flex items-center text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 text-xs transition-colors"
                      >
                        View Detail <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-10 w-10 text-amber-300 mb-2" />
                      <p className="font-semibold text-gray-700">No matching quotes found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-amber-100/60">
          {paginatedQuotes.length > 0 ? (
            paginatedQuotes.map((quote) => (
              <Link key={quote.id} to={`/quotes/${quote.id}`} className="block p-4 hover:bg-amber-50/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-red-900">{quote.quoteNumber}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[quote.status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-800 mb-1">{quote.customerName}</div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{quote.suburb || 'No suburb'}</span>
                  <span>{new Date(quote.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-gray-500">
              No quotes found matching filters.
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredQuotes.length > 0 && (
          <div className="bg-amber-50/30 px-6 py-4 border-t border-amber-100/60 flex items-center justify-between">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-gray-600">
                  Showing <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredQuotes.length)}</span> of <span className="font-bold text-gray-900">{filteredQuotes.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-xl shadow-xs -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-3 py-2 rounded-l-xl border border-amber-200 bg-white text-xs font-bold text-gray-700 hover:bg-amber-100/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                  </button>
                  <div className="relative inline-flex items-center px-4 py-2 border-t border-b border-amber-200 bg-amber-100/50 text-xs font-bold text-red-900">
                    {currentPage} / {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-3 py-2 rounded-r-xl border border-amber-200 bg-white text-xs font-bold text-gray-700 hover:bg-amber-100/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
