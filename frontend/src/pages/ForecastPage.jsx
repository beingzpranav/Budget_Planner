import { useEffect, useState } from 'react';
import { getForecast } from '../api';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

export default function ForecastPage() {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getForecast()
      .then(r => setForecasts(r.data.forecasts))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center" style={{ height: '60vh', gap: 16 }}>
      <div className="spinner spinner-lg" />
      <span className="text-secondary">Loading forecast...</span>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">AI Forecast</h1>
        <p className="page-subtitle">30-day spending forecast per category</p>
      </div>

      {/* Bar chart */}
      <div className="card mb-6">
        <h3 className="font-bold mb-4" style={{ fontSize: 15 }}>
          Predicted Spend — Next 30 Days
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={forecasts} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: '#64748B', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => formatCurrency(v, 'USD', true)}
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={130}
            />
            <Tooltip formatter={v => [formatCurrency(v), 'Forecast']} />
            <Bar dataKey="forecast_amount" radius={[0, 6, 6, 0]}>
              {forecasts.map((f, i) => (
                <Cell
                  key={i}
                  fill={f.trend === 'up' ? '#EF4444' : '#10B981'}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* List */}
      <div className="card">
        <h3 className="font-bold mb-4" style={{ fontSize: 15 }}>Category Breakdown</h3>
        {forecasts.map(f => (
          <div key={f.category} className="forecast-item">
            <div className="font-semibold" style={{ fontSize: 14 }}>{f.category}</div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-bold" style={{ fontSize: 16 }}>
                  {formatCurrency(f.forecast_amount)}
                </div>
                <div className="text-xs text-muted">predicted next month</div>
              </div>
              <div
                className={`flex items-center gap-1 font-bold text-sm ${
                  f.trend === 'up' ? 'forecast-arrow-up' : 'forecast-arrow-down'
                }`}
              >
                {f.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {f.trend_pct}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
