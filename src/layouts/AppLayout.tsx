import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { LayoutDashboard, FileText, LogOut, Menu, MessageSquare, HeartHandshake, BookOpen, CalendarDays, Users, Receipt } from 'lucide-react';
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
          <div>
            <h1 className="text-xl font-extrabold text-gold-gradient tracking-tight">NHN Biz</h1>
            <p className="text-[10px] tracking-widest text-amber-300/80 font-medium uppercase">Management Portal</p>
          </div>
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

          <Link
            to="/clients"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              isActive('/clients') || isActive('/sites')
                ? 'bg-gradient-to-r from-amber-400/25 to-amber-500/10 text-amber-200 border-l-4 border-amber-400 shadow-md shadow-amber-500/10 font-semibold'
                : 'text-amber-100/80 hover:bg-white/10 hover:text-amber-200'
            }`}
          >
            <Users size={18} className={isActive('/clients') || isActive('/sites') ? 'text-amber-300' : 'text-amber-300/70'} />
            Clients & Team
          </Link>

          <Link
            to="/tax-invoice"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              isActive('/tax-invoice')
                ? 'bg-gradient-to-r from-amber-400/25 to-amber-500/10 text-amber-200 border-l-4 border-amber-400 shadow-md shadow-amber-500/10 font-semibold'
                : 'text-amber-100/80 hover:bg-white/10 hover:text-amber-200'
            }`}
          >
            <Receipt size={18} className={isActive('/tax-invoice') ? 'text-amber-300' : 'text-amber-300/70'} />
            Billing & Payroll
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
          <Link
            to="/ledger"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              isActive('/ledger')
                ? 'bg-gradient-to-r from-amber-400/25 to-amber-500/10 text-amber-200 border-l-4 border-amber-400 shadow-md shadow-amber-500/10 font-semibold'
                : 'text-amber-100/80 hover:bg-white/10 hover:text-amber-200'
            }`}
          >
            <BookOpen size={18} className={isActive('/ledger') ? 'text-amber-300' : 'text-amber-300/70'} />
            Ledger & Receipts
          </Link>

          <Link
            to="/todo"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              isActive('/todo')
                ? 'bg-gradient-to-r from-amber-400/25 to-amber-500/10 text-amber-200 border-l-4 border-amber-400 shadow-md shadow-amber-500/10 font-semibold'
                : 'text-amber-100/80 hover:bg-white/10 hover:text-amber-200'
            }`}
          >
            <CalendarDays size={18} className={isActive('/todo') ? 'text-amber-300' : 'text-amber-300/70'} />
            TodoList 待办事项
          </Link>
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
          <h1 className="text-lg font-bold text-gold-gradient">NHN Biz</h1>
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
            <Link
              to="/clients"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Users size={18} className="text-amber-300" /> Clients & Team
            </Link>
            <Link
              to="/tax-invoice"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Receipt size={18} className="text-amber-300" /> Billing & Payroll
            </Link>
            <Link
              to="/ledger"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <BookOpen size={18} className="text-amber-300" /> Ledger & Receipts
            </Link>
            <Link
              to="/todo"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <CalendarDays size={18} className="text-amber-300" /> TodoList 待办事项
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
