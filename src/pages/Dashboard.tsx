import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { FileText, Clock, CheckCircle, BarChart3, ChevronRight } from 'lucide-react';

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-50 transition-transform group-hover:scale-150"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Quotes</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{data.kpi.totalQuotes}</p>
            </div>
            <div className="rounded-xl bg-indigo-100 p-3">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-50 transition-transform group-hover:scale-150"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">New</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{data.kpi.newQuotes}</p>
            </div>
            <div className="rounded-xl bg-blue-100 p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-50 transition-transform group-hover:scale-150"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Reviewing</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{data.kpi.reviewingQuotes}</p>
            </div>
            <div className="rounded-xl bg-amber-100 p-3">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-50 transition-transform group-hover:scale-150"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{data.kpi.approvedQuotes}</p>
            </div>
            <div className="rounded-xl bg-green-100 p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Quotes */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900">Recent Quote Requests</h2>
          <Link to="/quotes" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center">
            View all <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        {data.recentQuotes.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No recent quotes found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-white">
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quote #</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {data.recentQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium text-gray-900">{quote.quoteNumber}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-gray-700">{quote.customerName}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-gray-500">{quote.leadSourceName || '-'}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[quote.status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Link to={`/quotes/${quote.id}`} className="text-indigo-600 hover:text-indigo-900 opacity-0 group-hover:opacity-100 transition-opacity">
                        View detail
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
