import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { FileText, Clock, CheckCircle2, BarChart3, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';

interface DashboardData {
  kpi: {
    totalQuotes: number;
    newQuotes: number;
    reviewingQuotes: number;
    approvedQuotes: number;
  };
  recentQuotes: Array<{
    id: string;
    quoteNumber: string;
    customerName: string;
    status: string;
    createdAt: string;
    leadSourceName: string | null;
  }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/biz/dashboard');
        if (response.data?.success) {
          setData(response.data.data);
        } else {
          setError('Failed to load dashboard data.');
        }
      } catch (err) {
        setError('An error occurred while loading the dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

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

  if (error || !data) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-6 shadow-sm">
        <p className="text-sm font-medium text-red-800">{error}</p>
      </div>
    );
  }

  const statusStyles: Record<string, string> = {
    new: 'bg-gradient-to-r from-red-50 to-amber-50 text-red-700 border-red-300 font-semibold shadow-xs',
    reviewing: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
    approved: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
    rejected: 'bg-rose-50 text-rose-800 border-rose-300 font-semibold',
    closed: 'bg-gray-50 text-gray-700 border-gray-300',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl gradient-cny-header p-6 md:p-8 text-white shadow-xl shadow-red-900/10 border border-amber-500/30">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-gradient-to-br from-amber-400/20 to-transparent blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-amber-300/30 text-amber-200 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> NHN Power Platform • 业务控制台
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gold-gradient tracking-tight">
              Dashboard Overview
            </h1>
            <p className="mt-1 text-sm text-amber-100/80">
              Welcome back! Here is your real-time quote request activity and metrics.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-400/20">
            <TrendingUp className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-bold text-amber-200">Activity Active</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Quotes */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-cny border border-amber-200/60 hover:border-amber-400 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-red-600 via-amber-500 to-amber-400"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Quotes</p>
              <p className="mt-2 text-3xl font-extrabold text-gray-900">{data.kpi.totalQuotes}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-red-500 to-red-700 p-3.5 text-white shadow-md shadow-red-500/20 group-hover:scale-110 transition-transform">
              <BarChart3 className="h-6 w-6 text-amber-300" />
            </div>
          </div>
        </div>

        {/* New Quotes */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-cny border border-amber-200/60 hover:border-amber-400 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-amber-400 to-red-500"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">New Requests</p>
              <p className="mt-2 text-3xl font-extrabold text-red-700">{data.kpi.newQuotes}</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-3.5 text-red-950 shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <FileText className="h-6 w-6 text-red-950" />
            </div>
          </div>
        </div>

        {/* Reviewing Quotes */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-cny border border-amber-200/60 hover:border-amber-400 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-amber-500 to-amber-600"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Reviewing</p>
              <p className="mt-2 text-3xl font-extrabold text-amber-800">{data.kpi.reviewingQuotes}</p>
            </div>
            <div className="rounded-2xl bg-amber-100 p-3.5 text-amber-700 group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Approved Quotes */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-cny border border-amber-200/60 hover:border-amber-400 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-600"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Approved</p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-800">{data.kpi.approvedQuotes}</p>
            </div>
            <div className="rounded-2xl bg-emerald-100 p-3.5 text-emerald-700 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Quotes Table */}
      <div className="rounded-3xl bg-white shadow-cny border border-amber-200/60 overflow-hidden">
        <div className="border-b border-amber-100 px-6 py-5 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-100/30 to-red-500/5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 bg-red-600 rounded-full"></div>
            <h2 className="text-lg font-extrabold text-gray-900">Recent Quote Requests</h2>
          </div>
          <Link
            to="/quotes"
            className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-3.5 py-1.5 rounded-full border border-red-200 transition-colors"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        {data.recentQuotes.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 text-sm">No recent quote requests available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-amber-100/60">
              <thead>
                <tr className="bg-amber-50/40 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  <th scope="col" className="px-6 py-4 text-left">Quote #</th>
                  <th scope="col" className="px-6 py-4 text-left">Customer</th>
                  <th scope="col" className="px-6 py-4 text-left">Source</th>
                  <th scope="col" className="px-6 py-4 text-left">Status</th>
                  <th scope="col" className="px-6 py-4 text-left">Date</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/40 bg-white">
                {data.recentQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-amber-50/50 transition-colors group">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-bold text-red-900 group-hover:text-red-600 transition-colors">{quote.quoteNumber}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium text-gray-800">{quote.customerName}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 font-medium">
                        {quote.leadSourceName || 'Direct'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${statusStyles[quote.status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 font-medium">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold">
                      <Link
                        to={`/quotes/${quote.id}`}
                        className="inline-flex items-center text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg border border-red-200 text-xs transition-colors"
                      >
                        Detail <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
