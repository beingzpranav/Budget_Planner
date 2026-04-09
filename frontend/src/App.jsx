import { useEffect, useState, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ScanPage from './pages/ScanPage';
import ExpensesPage from './pages/ExpensesPage';
import BudgetPage from './pages/BudgetPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ForecastPage from './pages/ForecastPage';
import AnomaliesPage from './pages/AnomaliesPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './AuthContext';
import { ToastProvider } from './ToastContext';
import { getBudgetConfig } from './api';
import { Menu, X, ScanLine } from 'lucide-react';
import Loader from './components/ui/Loader';
import './index.css';

const PAGE_MAP = {
  dashboard: Dashboard,
  scan:      ScanPage,
  expenses:  ExpensesPage,
  budget:    BudgetPage,
  analytics: AnalyticsPage,
  forecast:  ForecastPage,
  anomalies: AnomaliesPage,
  settings:  SettingsPage,
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center w-full" style={{ minHeight: '60vh' }}>
      <Loader />
    </div>
  );
}

function AppShell() {
  const { user, loading, logout } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [requiresBudgetSetup, setRequiresBudgetSetup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const ActivePage = PAGE_MAP[activePage] || Dashboard;

  useEffect(() => {
    if (!user) {
      return;
    }
    getBudgetConfig()
      .then((response) => {
        const needsSetup = Boolean(response.data?.requires_setup);
        setRequiresBudgetSetup(needsSetup);
        if (needsSetup) {
          setActivePage('settings');
        }
      })
      .catch(() => {
        setRequiresBudgetSetup(false);
      });
  }, [user]);

  const handleChangePage = (nextPage) => {
    if (requiresBudgetSetup && nextPage !== 'settings') {
      setActivePage('settings');
      setSidebarOpen(false);
      return;
    }
    setActivePage(nextPage);
    setSidebarOpen(false);
  };

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        active={activePage}
        onChange={handleChangePage}
        user={user}
        onLogout={logout}
        requiresBudgetSetup={requiresBudgetSetup}
      />


      <main className="main-content">
        <Suspense fallback={<LoadingFallback />}>
          <ActivePage onNavigate={handleChangePage} />
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
