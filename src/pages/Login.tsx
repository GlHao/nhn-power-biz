import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { apiClient } from '../api/client';
import { LogIn, Sparkles, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { setAuth, token } = useAuthStore();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.data?.success) {
        const { token, user } = response.data.data;
        setAuth(token, user);
        navigate('/dashboard');
      } else {
        setError(response.data?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Invalid email or password.');
      } else {
        setError('An error occurred during login. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF4ED] bg-cny-pattern py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-red-600/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-cny border border-amber-200/80 p-8 sm:p-10 relative z-10">
        {/* Header Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 gradient-cny-header rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30 ring-4 ring-amber-300/40 transform hover:scale-105 transition-transform duration-300">
            <Sparkles className="h-8 w-8 text-amber-300" />
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 border border-amber-300/60 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-red-600" /> NHN Biz Management Portal
          </div>
          <h2 className="mt-3 text-3xl font-extrabold text-gray-900 tracking-tight">
            Sign In to <span className="text-red-gradient">NHN Biz</span>
          </h2>
          <p className="mt-1 text-xs text-gray-500 font-medium">
            Manage quote applications and client inquiries
          </p>
        </div>
        
        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 shadow-sm animate-shake">
              <p className="text-xs font-semibold text-red-800 text-center">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/20 text-gray-900 text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 focus:bg-white transition-all shadow-xs"
                placeholder="admin@nhn-power.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-amber-200 bg-amber-50/20 text-gray-900 text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 focus:bg-white transition-all shadow-xs"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-amber-100 gradient-cny-header hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-red-500/30 shadow-lg shadow-red-600/30 border border-amber-400/40 transition-all duration-200 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
              }`}
            >
              <span className="flex items-center gap-2 text-amber-200 font-bold">
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-300 border-t-transparent"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-amber-300" /> Sign In to Portal
                  </>
                )}
              </span>
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-amber-100">
          <p className="text-[11px] text-gray-400 font-medium">NHN Power Platform © 2026. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
