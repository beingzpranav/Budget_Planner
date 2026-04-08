import { useEffect, useState } from 'react';
import { getAnomalies } from '../api';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '../utils';


export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getAnomalies()
      .then(r => setAnomalies(r.data.anomalies))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center" style={{ height: '60vh', gap: 16 }}>
      <div className="spinner spinner-lg" />
      <span className="text-secondary">Scanning for anomalies...</span>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Anomaly Alerts</h1>
        <p className="page-subtitle">Unusual transactions flagged in your spending history</p>
      </div>

      {anomalies.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <ShieldCheck
            size={48}
            color="var(--success)"
            style={{ margin: '0 auto 16px' }}
          />
          <div className="font-bold" style={{ fontSize: 20, marginBottom: 8 }}>
            No Anomalies Detected
          </div>
          <div className="text-secondary">
            All your transactions are within normal spending ranges.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} color="var(--error)" />
            <span className="font-semibold">
              {anomalies.length} unusual transaction{anomalies.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {anomalies.map(a => {
            const score    = a.anomaly_info?.anomaly_score || 0;
            const severity = score > 0.8 ? 'High' : score > 0.5 ? 'Medium' : 'Low';
            const sevColor = score > 0.8 ? 'var(--error)' : score > 0.5 ? 'var(--warning)' : 'var(--text-muted)';
            const abovePct = a.anomaly_info?.avg_transaction_amount
              ? ((a.amount / a.anomaly_info.avg_transaction_amount - 1) * 100).toFixed(0)
              : null;

            return (
              <div
                key={a.id}
                className="card"
                style={{ borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.04)' }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={18} color="var(--error)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div className="font-bold" style={{ fontSize: 15 }}>{a.merchant}</div>
                      <div className="text-xs text-muted">{a.category} · {a.date}</div>
                    </div>
                  </div>
                  <div className="text-right" style={{ flexShrink: 0 }}>
                    <div className="font-bold" style={{ fontSize: 18, color: 'var(--error)' }}>
                      {formatCurrency(a.amount, a.currency)}
                    </div>
                    <span className="badge badge-error">⚠️ {severity} Severity</span>
                  </div>
                </div>

                {/* Stats */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 10,
                    fontSize: 12,
                    marginBottom: 14,
                  }}
                >
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 12px' }}>
                    <div className="text-muted mb-1">Anomaly Score</div>
                    <div className="font-bold" style={{ color: sevColor }}>
                      {(score * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 12px' }}>
                    <div className="text-muted mb-1">Category Avg</div>
                    <div className="font-bold">
                      {formatCurrency(a.anomaly_info?.avg_transaction_amount, a.currency)}
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 12px' }}>
                    <div className="text-muted mb-1">Above Average</div>
                    <div className="font-bold text-error">{abovePct ? `${abovePct}%` : 'N/A'}</div>
                  </div>
                </div>

                {/* Score bar */}
                <div className="progress-bar" style={{ height: 6 }}>
                  <div
                    style={{
                      height: '100%', borderRadius: 99,
                      width: `${score * 100}%`,
                      background:
                        score > 0.8
                          ? 'linear-gradient(90deg, #EF4444, #F87171)'
                          : 'linear-gradient(90deg, #F59E0B, #FCD34D)',
                      transition: 'width 0.8s',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
