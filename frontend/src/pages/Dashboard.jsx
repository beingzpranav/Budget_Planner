import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Receipt, Wallet, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getAnalytics, getBudget, getAnomalies } from '../api';
import { formatCurrency, getCurrencySymbol } from '../utils';


const PIE_COLORS = [
  '#2563EB','#10B981','#F59E0B','#EF4444','#8B5CF6',
  '#06B6D4','#EC4899','#F97316','#84CC16','#14B8A6','#6366F1'
];

function StatCard({ label, value, delta, up, icon: Icon, color }) {
  return (
    <div className="stat-card" style={{ '--accent-gradient': `linear-gradient(90deg, ${color}, ${color}99)` }}>
      <div className="stat-header">
        <div className="stat-icon" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
          <Icon size={20} color={color} />
        </div>
        {delta && (
          <div className={`stat-delta ${up ? 'up' : 'down'}`}>
            {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {delta}
          </div>
        )}
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card" style={{ padding: '10px 14px', minWidth: 140 }}>
      <div className="text-xs text-muted mb-2">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span style={{ color: p.color, fontWeight: 700 }}>{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard({ onNavigate }) {
  const [analytics, setAnalytics] = useState(null);
  const [budget, setBudget] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalytics(), getBudget(), getAnomalies()])
      .then(([a, b, an]) => {
        setAnalytics(a.data);
        setBudget(b.data);
        setAnomalies(an.data.anomalies);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '60vh', flexDirection: 'column', gap: 16 }}>
        <div className="spinner spinner-lg" />
        <span className="text-secondary">Loading dashboard...</span>
      </div>
    );
  }

  const pieData = analytics?.by_category?.slice(0, 7) || [];
  const monthlyData = analytics?.monthly_trend?.map(m => ({
    month: m.month?.slice(5),
    amount: m.amount
  })) || [];

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">AI-powered expense tracking & budget intelligence</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4 mb-6">
        <StatCard
          label="Total Spent"
          value={formatCurrency(analytics?.total_spent)}
          icon={Receipt}
          color="#2563EB"
          delta="This Month"
          up={false}
        />
        <StatCard
          label="Total Budget"
          value={formatCurrency(budget?.total_budget)}
          icon={Wallet}
          color="#10B981"
          delta={`${budget?.overall_percentage || 0}% used`}
          up={false}
        />
        <StatCard
          label="Transactions"
          value={analytics?.total_transactions || 0}
          icon={TrendingUp}
          color="#F59E0B"
          delta="+12.4%"
          up={true}
        />
        <StatCard
          label="Anomalies"
          value={anomalies.length}
          icon={AlertTriangle}
          color={anomalies.length > 0 ? '#EF4444' : '#10B981'}
          delta={anomalies.length > 0 ? 'Needs review' : 'All clear'}
          up={anomalies.length === 0}
        />
      </div>

      {/* Charts Row */}
      <div className="grid-2 mb-6">
        {/* Monthly Trend */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ fontSize: 15 }}>Monthly Spending Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v, 'USD', true)} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2.5} fill="url(#grad1)" dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ fontSize: 15 }}>Spending by Category</h3>
          </div>
          <div className="flex gap-4 items-center">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="amount" paddingAngle={3}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [formatCurrency(v), 'Spent']} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {pieData.slice(0, 5).map((d, i) => (
                <div key={i} className="flex items-center gap-2" style={{ fontSize: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i], flexShrink: 0 }} />
                  <span className="text-muted truncate" style={{ flex: 1 }}>{d.category}</span>
                  <span className="font-semibold">{formatCurrency(d.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Budget overview quick panel */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold" style={{ fontSize: 15 }}>Budget Overview</h3>
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('settings')}>
              Settings
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('budget')}>
              Manage →
            </button>
          </div>
        </div>
        {budget?.categories?.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {budget?.categories?.slice(0, 6).map(cat => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{cat.category}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {formatCurrency(cat.spent)} / {formatCurrency(cat.limit)}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${cat.status}`} style={{ width: `${cat.percentage}%` }} />
                </div>
                <div className="flex justify-between mt-1" style={{ fontSize: 11 }}>
                  <span className={`text-${cat.status === 'over' ? 'error' : cat.status === 'warning' ? 'warning' : 'success'}`}>
                    {cat.percentage}%
                  </span>
                  <span className="text-muted">{formatCurrency(cat.remaining)} left</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-secondary text-sm">
            No budget categories selected yet. Configure categories in Settings.
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="card">
        <h3 className="font-bold mb-4" style={{ fontSize: 15 }}>Quick Actions</h3>
        <div className="flex gap-3 flex-wrap">
          <button className="btn btn-primary" onClick={() => onNavigate('scan')}>
            🔍 Scan New Receipt
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('expenses')}>
            📋 View Expenses
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('forecast')}>
            🤖 AI Forecast
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('anomalies')}>
            ⚠️ Check Anomalies
          </button>
        </div>
      </div>
    </div>
  );
}
