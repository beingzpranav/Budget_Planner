import { useEffect, useState } from 'react';
import { getBudget, updateBudget } from '../api';
import { useToast } from '../ToastContext';
import { Edit2, Check, X, Wallet, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../utils';
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Tooltip
} from 'recharts';

const STATUS_COLORS = { good: '#10B981', warning: '#F59E0B', over: '#EF4444' };
const STATUS_LABELS = { good: '✅ On Track', warning: '⚠️ Approaching Limit', over: '🔴 Over Budget' };

function BudgetCard({ cat, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [tempLimit, setTempLimit] = useState(cat.limit);
  const toast = useToast();
  const color = STATUS_COLORS[cat.status] || '#10B981';

  const save = async () => {
    try {
      await onUpdate(cat.category, parseFloat(tempLimit));
      toast(`Budget updated for ${cat.category}`, 'success');
      setEditing(false);
    } catch {
      toast('Failed to update budget', 'error');
    }
  };

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Color strip */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color }} />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold" style={{ fontSize: 14 }}>{cat.category}</h3>
          <span style={{ fontSize: 11, color: color, fontWeight: 600 }}>{STATUS_LABELS[cat.status]}</span>
        </div>
        {!editing ? (
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditing(true); setTempLimit(cat.limit); }}>
            <Edit2 size={14} />
          </button>
        ) : (
          <div className="flex gap-2">
            <button className="btn btn-icon btn-sm" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)' }} onClick={save}>
              <Check size={14} />
            </button>
            <button className="btn btn-icon btn-sm" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--error)' }} onClick={() => setEditing(false)}>
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Progress ring area */}
      <div className="flex items-center gap-4">
        <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%" outerRadius="100%"
              data={[{ value: cat.percentage, fill: color }]}
              startAngle={90} endAngle={-270}
            >
              <RadialBar dataKey="value" cornerRadius={4} background={{ fill: 'var(--bg-elevated)' }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color
          }}>
            {cat.percentage}%
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-muted">Spent</span>
            <span className="text-xs font-semibold">{formatCurrency(cat.spent)}</span>
          </div>
          <div className="flex justify-between mb-3">
            <span className="text-xs text-muted">Budget</span>
            {editing ? (
              <input
                className="form-input"
                style={{ width: 100, padding: '3px 8px', fontSize: 12, height: 'auto' }}
                type="number"
                value={tempLimit}
                onChange={e => setTempLimit(e.target.value)}
              />
            ) : (
              <span className="text-xs font-semibold">{formatCurrency(cat.limit)}</span>
            )}
          </div>
          <div className="progress-bar" style={{ height: 6 }}>
            <div
              className={`progress-fill ${cat.status}`}
              style={{ width: `${Math.min(cat.percentage, 100)}%`, background: color }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {cat.remaining > 0 ? `${formatCurrency(cat.remaining)} left` : `${formatCurrency(Math.abs(cat.limit - cat.spent))} Over`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BudgetPage() {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBudget = () => {
    setLoading(true);
    getBudget()
      .then(r => setBudget(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBudget(); }, []);

  const handleUpdate = async (category, limit) => {
    await updateBudget(category, limit);
    fetchBudget();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '60vh', gap: 16 }}>
        <div className="spinner spinner-lg" />
        <span className="text-secondary">Loading budget data...</span>
      </div>
    );
  }

  if (budget?.requires_setup) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Budget Manager</h1>
          <p className="page-subtitle">
            Complete budget setup in Settings before tracking limits.
          </p>
        </div>
        <div className="card">
          <h3 className="font-bold mb-2">Budget setup required</h3>
          <p className="text-muted mb-4">
            Choose your own categories and define monthly limits.
            Healthcare is optional.
          </p>
          <button className="btn btn-primary" onClick={() => onNavigate?.('settings')}>
            Open Settings
          </button>
        </div>
      </div>
    );
  }

  const overCount = budget?.categories?.filter(c => c.status === 'over').length || 0;
  const warningCount = budget?.categories?.filter(c => c.status === 'warning').length || 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Budget Manager</h1>
        <p className="page-subtitle">Track and manage your spending limits across all categories</p>
      </div>

      {/* Summary cards */}
      <div className="grid-3 mb-6">
        <div className="stat-card" style={{ '--accent-gradient': 'linear-gradient(90deg,#2563EB,#3B82F6)' }}>
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(37,99,235,0.15)' }}>
              <Wallet size={20} color="var(--primary-light)" />
            </div>
          </div>
          <div>
            <div className="stat-label">Total Budget</div>
            <div className="stat-value">{formatCurrency(budget?.total_budget)}</div>
          </div>
        </div>
        <div className="stat-card" style={{ '--accent-gradient': 'linear-gradient(90deg,#10B981,#34D399)' }}>
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <TrendingDown size={20} color="var(--success)" />
            </div>
          </div>
          <div>
            <div className="stat-label">Total Spent</div>
            <div className="stat-value">{formatCurrency(budget?.total_spent)}</div>
          </div>
        </div>
        <div className="stat-card" style={{ '--accent-gradient': `linear-gradient(90deg,${overCount > 0 ? '#EF4444' : '#10B981'},${overCount > 0 ? '#F87171' : '#34D399'})` }}>
          <div className="stat-header">
            <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>
              <span style={{ fontSize: 20 }}>{overCount > 0 ? '🔴' : '✅'}</span>
            </div>
          </div>
          <div>
            <div className="stat-label">Status</div>
            <div className="stat-value" style={{ fontSize: 18 }}>
              {overCount} over · {warningCount} warning
            </div>
          </div>
        </div>
      </div>

      {/* Overall bar */}
      <div className="card mb-6">
        <div className="flex justify-between mb-3">
          <span className="font-semibold">Overall Budget Utilization</span>
          <span className="font-bold" style={{ color: budget?.overall_percentage > 90 ? 'var(--error)' : 'var(--text-primary)' }}>
            {budget?.overall_percentage}%
          </span>
        </div>
        <div className="progress-bar" style={{ height: 14 }}>
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(budget?.overall_percentage || 0, 100)}%`,
              background: budget?.overall_percentage > 90
                ? 'linear-gradient(90deg, #EF4444, #F87171)'
                : budget?.overall_percentage > 70
                ? 'linear-gradient(90deg, #F59E0B, #FCD34D)'
                : 'linear-gradient(90deg, #10B981, #34D399)'
            }}
          />
        </div>
        <div className="flex justify-between mt-2" style={{ fontSize: 12 }}>
          <span className="text-muted">{formatCurrency(budget?.total_spent)} spent</span>
          <span className="text-muted">{formatCurrency(budget?.total_remaining)} remaining</span>
        </div>
      </div>

      {/* Category cards */}
      <div className="grid-auto">
        {budget?.categories?.map(cat => (
          <BudgetCard key={cat.category} cat={cat} onUpdate={handleUpdate} />
        ))}
      </div>
    </div>
  );
}
