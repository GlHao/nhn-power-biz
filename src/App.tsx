import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Quotes from './pages/Quotes';
import QuoteDetail from './pages/QuoteDetail';
import Clients from './pages/Clients';
import Sites from './pages/Sites';
import BillingRules from './pages/BillingRules';
import ScheduleRules from './pages/ScheduleRules';
import TaxInvoice from './pages/TaxInvoice';
import { useAuthStore } from './store/auth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="quotes" element={<Quotes />} />
          <Route path="quotes/:id" element={<QuoteDetail />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:clientId/sites" element={<Sites />} />
          <Route path="sites/:siteId/billing-rules" element={<BillingRules />} />
          <Route path="sites/:siteId/schedule-rules" element={<ScheduleRules />} />
          <Route path="tax-invoice" element={<TaxInvoice />} />
        </Route>
      </Routes>
    </Router>
  );
}
