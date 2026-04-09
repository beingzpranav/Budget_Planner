import { useEffect, useState } from 'react';
import { getForecast } from '../api';
import Loader from '../components/ui/Loader';
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
    <div className="flex items-center justify-center w-full" style={{ minHeight: '60vh' }}>
      <Loader />
    </div>
  );

  return (
    <div className='mt-8 max-w-7xl mx-auto'>
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h2 className='text-2xl font-bold text-white tracking-tight'>AI Forecast</h2>
          <p className='text-sm text-slate-400 mt-1'>Real-time 30-day predicted spending calculated actively from your data.</p>
        </div>
        <div className='hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest'>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Live Model
        </div>
      </div>

      {/* Bar chart */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 shadow-lg mb-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-semibold text-white tracking-tight">Predicted Spend</h3>
           <span className="text-xs text-slate-400 font-medium px-2.5 py-1 bg-slate-800/50 rounded-md border border-slate-700/50">Next 30 Days</span>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={forecasts} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: '#64748B', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => formatCurrency(v, 'USD', true)}
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fill: '#94A3B8', fontSize: 13, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              width={140}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
              formatter={v => [formatCurrency(v), 'Forecast']} 
            />
            <Bar dataKey="forecast_amount" radius={[0, 4, 4, 0]}>
              {forecasts.map((f, i) => (
                <Cell
                  key={i}
                  fill={f.trend === 'up' ? '#ef4444' : '#10b981'}
                  fillOpacity={0.9}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Grid List */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 shadow-lg backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white tracking-tight mb-6">Category Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forecasts.map(f => (
            <div key={f.category} className="flex flex-col p-5 rounded-xl border border-slate-800/60 bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <span className="font-semibold text-slate-200 text-sm">{f.category}</span>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border shadow-sm ${f.trend === 'up' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                  {f.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {f.trend_pct}%
                </div>
              </div>
              <div className="flex flex-col mt-auto">
                  <span className="text-3xl font-bold tracking-tight text-white mb-1" style={{ fontFeatureSettings: '"tnum" 1' }}>{formatCurrency(f.forecast_amount)}</span>
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Predicted Next Month</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
