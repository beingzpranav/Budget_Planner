import { useEffect, useState } from 'react';
import { getAnalytics } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Award, Activity } from 'lucide-react';

const PIE_COLORS = [
  '#2563EB','#10B981','#F59E0B','#EF4444','#8B5CF6',
  '#06B6D4','#EC4899','#F97316','#84CC16','#14B8A6','#6366F1'
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card" style={{ padding: '10px 14px' }}>
      <div className="text-xs text-muted mb-1">{label}</div>
      <div className="font-bold">₹{payload[0]?.value?.toLocaleString('en-IN')}</div>
    </div>
  );
};

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center" style={{ height: '60vh', gap: 16 }}>
      <div className="spinner spinner-lg" /> <span className="text-secondary">Loading analytics...</span>
    </div>
  );

  const catData = [...(data?.by_category || [])].sort((a, b) => b.amount - a.amount);
  const monthData = data?.monthly_trend?.map(m => ({ month: m.month?.slice(5), amount: m.amount })) || [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Deep insights into your spending patterns powered by ML</p>
      </div>

      {/* KPI Cards */}
      <div className="grid-4 mb-6">
        {[
          { label: 'Total Spent', value: `₹${data?.total_spent?.toLocaleString('en-IN')}`, icon: TrendingUp, color: '#2563EB' },
          { label: 'Transactions', value: data?.total_transactions, icon: Activity, color: '#10B981' },
          { label: 'Avg Transaction', value: `₹${data?.avg_transaction?.toFixed(2)}`, icon: BarChart3, color: '#F59E0B' },
          { label: 'Top Merchant', value: data?.top_merchant, icon: Award, color: '#8B5CF6' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card" style={{ '--accent-gradient': `linear-gradient(90deg,${color},${color}99)` }}>
            <div className="stat-icon" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div className="stat-label">{label}</div>
              <div className="stat-value" style={{ fontSize: typeof value === 'string' && value.length > 10 ? 16 : 24 }}>
                {value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart - Spending by Category */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold" style={{ fontSize: 15 }}>Spending by Category</h3>
            <p className="text-xs text-muted">SVM + Random Forest multi-class classification</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={catData} margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="category" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={55} />
            <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" radius={[6,6,0,0]}>
              {catData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid-2">
        {/* Monthly Area Chart */}
        <div className="card">
          <h3 className="font-bold mb-4" style={{ fontSize: 15 }}>Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthData}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#aGrad)" dot={{ fill: '#8B5CF6', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie & Legend */}
        <div className="card">
          <h3 className="font-bold mb-4" style={{ fontSize: 15 }}>Category Distribution</h3>
          <div className="flex" style={{ alignItems: 'center', gap: 12 }}>
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={catData.slice(0, 8)} cx="50%" cy="50%" outerRadius={80} dataKey="amount" paddingAngle={2}>
                  {catData.slice(0, 8).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {catData.slice(0, 8).map((d, i) => {
                const pct = Math.round((d.amount / (data?.total_spent || 1)) * 100);
                return (
                  <div key={d.category} className="flex items-center gap-2" style={{ fontSize: 11 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i], flexShrink: 0 }} />
                    <span className="text-muted" style={{ flex: 1 }}>{d.category}</span>
                    <span className="font-bold">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
