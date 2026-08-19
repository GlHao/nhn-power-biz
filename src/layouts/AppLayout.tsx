import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { LayoutDashboard, FileText, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export function AppLayout() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">NHN Biz</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded hover:bg-gray-100">
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link to="/quotes" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded hover:bg-gray-100">
            <FileText size={20} />
            Quotes
          </Link>

          {/* Future Modules (Disabled) */}
          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Future Modules
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-gray-400 rounded cursor-not-allowed">
            Feedback
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-gray-400 rounded cursor-not-allowed">
            Care
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-gray-400 rounded cursor-not-allowed">
            Finance
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-gray-400 rounded cursor-not-allowed">
            Ledger
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-gray-400 rounded cursor-not-allowed">
            Janiking
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-gray-400 rounded cursor-not-allowed">
            Shift
          </div>
        </nav>
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 text-red-600 rounded hover:bg-red-50 w-full text-left">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Menu & Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b">
          <h1 className="text-xl font-bold">NHN Biz</h1>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu size={24} />
          </button>
        </header>
        
        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <nav className="md:hidden bg-white border-b p-4 space-y-2">
            <Link to="/dashboard" className="block px-3 py-2 text-gray-700 rounded hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
            <Link to="/quotes" className="block px-3 py-2 text-gray-700 rounded hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(false)}>Quotes</Link>
            
            {/* Future Modules (Disabled) */}
            <div className="pt-2 pb-1 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Future Modules
            </div>
            <div className="block px-3 py-2 text-gray-400 rounded cursor-not-allowed">Feedback</div>
            <div className="block px-3 py-2 text-gray-400 rounded cursor-not-allowed">Care</div>
            <div className="block px-3 py-2 text-gray-400 rounded cursor-not-allowed">Finance</div>
            <div className="block px-3 py-2 text-gray-400 rounded cursor-not-allowed">Ledger</div>
            <div className="block px-3 py-2 text-gray-400 rounded cursor-not-allowed">Janiking</div>
            <div className="block px-3 py-2 text-gray-400 rounded cursor-not-allowed">Shift</div>
            <button onClick={handleLogout} className="block px-3 py-2 text-red-600 w-full text-left">Logout</button>
          </nav>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
