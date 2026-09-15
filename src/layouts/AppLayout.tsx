import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { LayoutDashboard, FileText, LogOut, Menu, Sparkles, MessageSquare, HeartHandshake, Landmark, BookOpen, Building2, CalendarDays } from 'lucide-react';
import { useState } from 'react';

export function AppLayout() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex h-screen bg-[#FAF4ED] bg-cny-pattern overflow-hidden">
      {/* Desktop Sidebar - Chinese Imperial Red & Gold */}
      <aside className="hidden md:flex flex-col w-64 gradient-cny-red text-amber-50 shadow-2xl z-20 border-r border-amber-500/30">
        {/* Header / Logo */}
        <div className="p-5 border-b border-amber-500/20 flex items-center justify-between bg-black/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-amber-300/40">
              <Sparkles className="h-5 w-5 text-red-950" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gold-gradient tracking-tight">NHN Biz</h1>
              <p className="text-[10px] tracking-widest text-amber-300/80 font-medium uppercase">Management Portal</p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
            新春版
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-amber-300/60 uppercase tracking-widest">
            Core Modules
          </div>
          
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              isActive('/dashboard')
                ? 'bg-gradient-to-r from-amber-400/25 to-amber-500/10 text-amber-200 border-l-4 border-amber-400 shadow-md shadow-amber-500/10 font-semibold'
                : 'text-amber-100/80 hover:bg-white/10 hover:text-amber-200'
            }`}
          >
            <LayoutDashboard size={18} className={isActive('/dashboard') ? 'text-amber-300' : 'text-amber-300/70'} />
            Dashboard
          </Link>

          <Link
            to="/quotes"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              isActive('/quotes')
                ? 'bg-gradient-to-r from-amber-400/25 to-amber-500/10 text-amber-200 border-l-4 border-amber-400 shadow-md shadow-amber-500/10 font-semibold'
                : 'text-amber-100/80 hover:bg-white/10 hover:text-amber-200'
            }`}
          >
            <FileText size={18} className={isActive('/quotes') ? 'text-amber-300' : 'text-amber-300/70'} />
            Quotes
          </Link>

          {/* Future Modules */}
          <div className="pt-6 pb-2 px-3 text-[10px] font-semibold text-amber-300/50 uppercase tracking-widest">
            Future Modules
          </div>

          <div className="flex items-center gap-3 px-3.5 py-2 text-amber-200/40 text-sm rounded-xl cursor-not-allowed">
            <MessageSquare size={16} /> Feedback
          </div>
          <div className="flex items-center gap-3 px-3.5 py-2 text-amber-200/40 text-sm rounded-xl cursor-not-allowed">
            <HeartHandshake size={16} /> Care
          </div>
          <div className="flex items-center gap-3 px-3.5 py-2 text-amber-200/40 text-sm rounded-xl cursor-not-allowed">
            <Landmark size={16} /> Finance
          </div>
          <div className="flex items-center gap-3 px-3.5 py-2 text-amber-200/40 text-sm rounded-xl cursor-not-allowed">
            <BookOpen size={16} /> Ledger
          </div>
          <div className="flex items-center gap-3 px-3.5 py-2 text-amber-200/40 text-sm rounded-xl cursor-not-allowed">
            <Building2 size={16} /> Janiking
          </div>
          <div className="flex items-center gap-3 px-3.5 py-2 text-amber-200/40 text-sm rounded-xl cursor-not-allowed">
            <CalendarDays size={16} /> Shift
          </div>
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-amber-500/20 bg-black/20">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-amber-200 bg-red-950/60 hover:bg-amber-400 hover:text-red-950 border border-amber-400/40 transition-all duration-200 w-full shadow-sm"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Top Header */}
        <header className="md:hidden flex items-center justify-between p-4 gradient-cny-red text-amber-50 border-b border-amber-500/30 shadow-md">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-red-950 font-bold">
              <Sparkles size={16} />
            </div>
            <h1 className="text-lg font-bold text-gold-gradient">NHN Biz</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg bg-white/10 text-amber-200 hover:bg-white/20"
          >
            <Menu size={22} />
          </button>
        </header>
        
        {/* Mobile Dropdown Nav */}
        {isMobileMenuOpen && (
          <nav className="md:hidden gradient-cny-red border-b border-amber-500/30 p-4 space-y-2 text-amber-100 shadow-xl z-30">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutDashboard size={18} className="text-amber-300" /> Dashboard
            </Link>
            <Link
              to="/quotes"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FileText size={18} className="text-amber-300" /> Quotes
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-amber-200 bg-red-950/60 border border-amber-400/30 w-full text-left mt-3"
            >
              <LogOut size={18} /> Logout
            </button>
          </nav>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
