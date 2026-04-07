import {
  LayoutDashboard, ScanLine, Wallet, BarChart3,
  AlertTriangle, Settings, TrendingUp, Receipt, LogOut
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',       icon: LayoutDashboard },
  { id: 'scan',      label: 'Scan Receipt',     icon: ScanLine },
  { id: 'expenses',  label: 'Expenses',         icon: Receipt },
  { id: 'budget',    label: 'Budget Manager',   icon: Wallet },
  { id: 'analytics', label: 'Analytics',        icon: BarChart3 },
  { id: 'forecast',  label: 'AI Forecast',      icon: TrendingUp },
  { id: 'anomalies', label: 'Anomaly Alerts',   icon: AlertTriangle },
];

export default function Sidebar({ active, onChange, user, onLogout, requiresBudgetSetup }) {
  const visibleItems = requiresBudgetSetup
    ? []
    : NAV_ITEMS;

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <div className="brand-icon">
            <ScanLine size={20} color="white" />
          </div>
          <div>
            <div className="brand-name">ReceiptAI</div>
            <div className="brand-sub">Budget Planner</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        {visibleItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item${active === id ? ' active' : ''}`}
            onClick={() => onChange(id)}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}

        <div className="nav-section-label" style={{ marginTop: 8 }}>System</div>
        <button
          className={`nav-item${active === 'settings' ? ' active' : ''}`}
          onClick={() => onChange('settings')}
        >
          <Settings size={17} />
          Settings
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="mb-3 text-xs text-muted">
          Signed in as {user?.email}
        </div>
        {requiresBudgetSetup ? (
          <div className="text-xs text-muted mb-3">
            Complete budget setup to unlock all pages.
          </div>
        ) : null}
        <button className="nav-item mt-4 w-full" onClick={onLogout}>
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}
