import { useEffect, useState } from 'react';
import { Trash2, Filter, Search, Receipt, Wallet, List } from 'lucide-react';
import { getExpenses, deleteExpense } from '../api';
import { useToast } from '../ToastContext';
import { format, parseISO } from 'date-fns';
import { formatCurrency, getCurrencySymbol } from '../utils';


const CATEGORIES = [
  'All', 'Food & Dining', 'Groceries', 'Transportation', 'Healthcare',
  'Entertainment', 'Utilities', 'Shopping', 'Education', 'Travel',
  'Personal Care', 'Miscellaneous'
];

const CAT_COLORS = {
  'Food & Dining': '#F97316', 'Groceries': '#10B981', 'Transportation': '#3B82F6',
  'Healthcare': '#EF4444', 'Entertainment': '#8B5CF6', 'Utilities': '#06B6D4',
  'Shopping': '#EC4899', 'Education': '#F59E0B', 'Travel': '#14B8A6',
  'Personal Care': '#84CC16', 'Miscellaneous': '#6B7280',
};

export default function ExpensesPage() {
  const toast = useToast();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [deletingId, setDeletingId] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);

  const fetchExpenses = () => {
    setLoading(true);
    getExpenses({ limit: 100 })
      .then(res => setExpenses(res.data.expenses))
      .catch(() => toast('Failed to load expenses', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
      toast('Expense deleted', 'success');
    } catch {
      toast('Failed to delete', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = expenses.filter(e => {
    const matchCat = catFilter === 'All' || e.category === catFilter;
    const matchSearch = !search ||
      e.merchant?.toLowerCase().includes(search.toLowerCase()) ||
      e.category?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Expenses</h1>
            <p className="page-subtitle">All your scanned and tracked expenses</p>
          </div>
          <div className="card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <Wallet size={16} color="var(--primary-light)" />
            <div>
              <div className="text-xs text-muted">Total ({filtered.length} items)</div>
              <div className="font-bold" style={{ fontSize: 18 }}>{formatCurrency(total, filtered[0]?.currency)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex gap-3 flex-wrap items-center">
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 36, width: '100%' }}
              placeholder="Search merchant or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Filter size={15} color="var(--text-muted)" style={{ alignSelf: 'center' }} />
            {CATEGORIES.slice(0, 7).map(cat => (
              <button
                key={cat}
                className={`btn btn-sm ${catFilter === cat ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setCatFilter(cat)}
              >
                {cat}
              </button>
            ))}
            <select
              className="form-input form-select"
              style={{ padding: '7px 34px 7px 12px', fontSize: 13 }}
              value={CATEGORIES.slice(7).includes(catFilter) ? catFilter : ''}
              onChange={e => e.target.value && setCatFilter(e.target.value)}
            >
              <option value="">More...</option>
              {CATEGORIES.slice(7).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center" style={{ height: 300, gap: 16 }}>
          <div className="spinner" /> <span className="text-secondary">Loading expenses...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <Receipt size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <div className="font-bold" style={{ fontSize: 18, marginBottom: 8 }}>No expenses found</div>
          <div className="text-secondary text-sm">Try changing your filters or scan a new receipt.</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Items</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Confidence</th>
                <th>Source</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const catColor = CAT_COLORS[e.category] || '#6B7280';
                return (
                  <tr key={e.id}>
                    <td>
                      <div className="font-semibold" style={{ fontSize: 14 }}>{e.merchant}</div>
                      {e.items?.length > 0 && (
                        <div className="text-xs text-muted">{e.items.length} item{e.items.length !== 1 ? 's' : ''}</div>
                      )}
                    </td>
                    <td>
                      {e.items?.length > 0 ? (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setSelectedExpense(e)}
                        >
                          <List size={14} />
                          View ({e.items.length})
                        </button>
                      ) : (
                        <span className="text-xs text-muted">No items parsed</span>
                      )}
                    </td>
                    <td>
                      <span className="category-tag" style={{ background: `${catColor}22`, color: catColor, border: `1px solid ${catColor}44` }}>
                        {e.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{e.date}</div>
                    </td>
                    <td>
                      <div className="font-bold" style={{ fontSize: 15 }}>{formatCurrency(e.amount, e.currency)}</div>
                      <div className="text-xs text-muted">+{formatCurrency(e.tax, e.currency)} tax</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar" style={{ width: 60 }}>
                          <div className="progress-fill good" style={{ width: `${(e.confidence || 0) * 100}%` }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{Math.round((e.confidence || 0) * 100)}%</span>
                      </div>
                    </td>
                    <td>
                      <span className='badge badge-primary'>
                        📷 Scanned
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-icon btn-danger btn-sm"
                        onClick={() => handleDelete(e.id)}
                        disabled={deletingId === e.id}
                        title="Delete"
                      >
                        {deletingId === e.id ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Trash2 size={14} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedExpense ? (
        <div className="modal-overlay" onClick={() => setSelectedExpense(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Parsed Items</div>
                <div className="text-sm text-muted mt-1">
                  {selectedExpense.merchant} · {selectedExpense.date}
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => setSelectedExpense(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {selectedExpense.items?.length > 0 ? (
              <div>
                {selectedExpense.items.map((item, index) => (
                  <div
                    key={`${selectedExpense.id}-${index}`}
                    className="flex items-center justify-between"
                    style={{
                      padding: '10px 0',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <span className="text-secondary">
                      {item.name} {item.qty > 1 ? `× ${item.qty}` : ''}
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(item.price, selectedExpense?.currency)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-secondary">No itemized lines found for this expense.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
