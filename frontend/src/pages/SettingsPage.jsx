import { useEffect, useMemo, useState } from 'react'
import { Save, ShieldCheck, ArrowRight } from 'lucide-react'
import { getBudgetConfig, updateBudgetConfig } from '../api'
import { useToast } from '../ToastContext'

function normaliseCategoryState (categories) {
  return categories.map((item) => ({
    category: item.category,
    enabled: Boolean(item.enabled),
    limit: Number(item.limit) || 0,
  }))
}

export default function SettingsPage ({ onNavigate }) {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [requiresSetup, setRequiresSetup] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    getBudgetConfig()
      .then((response) => {
        setRequiresSetup(Boolean(response.data.requires_setup))
        setCategories(normaliseCategoryState(response.data.categories || []))
      })
      .catch(() => toast('Failed to load settings', 'error'))
      .finally(() => setLoading(false))
  }, [toast])

  const selectedCount = useMemo(
    () => categories.filter((item) => item.enabled).length,
    [categories],
  )

  const handleToggleCategory = (categoryName) => {
    setCategories((prev) =>
      prev.map((item) => {
        if (item.category !== categoryName) {
          return item
        }
        return { ...item, enabled: !item.enabled }
      }),
    )
  }

  const handleUpdateLimit = (categoryName, value) => {
    setCategories((prev) =>
      prev.map((item) => {
        if (item.category !== categoryName) {
          return item
        }
        return { ...item, limit: Number(value) || 0 }
      }),
    )
  }

  const handleSave = async () => {
    if (selectedCount === 0) {
      toast('Select at least one budget category', 'error')
      return
    }

    const invalidLimit = categories.some(
      (item) => item.enabled && Number(item.limit) <= 0,
    )
    if (invalidLimit) {
      toast('Set a monthly limit greater than 0 for selected categories', 'error')
      return
    }

    setSaving(true)
    try {
      await updateBudgetConfig(categories)
      setRequiresSetup(false)
      toast('Budget settings saved successfully', 'success')
      onNavigate?.('budget')
    } catch {
      toast('Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center' style={{ height: '60vh', gap: 16 }}>
        <div className='spinner spinner-lg' />
        <span className='text-secondary'>Loading settings...</span>
      </div>
    )
  }

  return (
    <div>
      <div className='page-header'>
        <h1 className='page-title'>Settings</h1>
        <p className='page-subtitle'>
          Configure your own budget categories and limits.
          Healthcare is optional.
        </p>
      </div>

      {requiresSetup ? (
        <div className='card mb-6' style={{ border: '1px solid rgba(245, 158, 11, 0.35)' }}>
          <div className='flex items-center gap-3'>
            <ShieldCheck size={18} color='var(--warning)' />
            <span className='font-semibold'>
              Budget setup is required before using Budget Manager.
            </span>
          </div>
        </div>
      ) : null}

      <div className='mt-8'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h2 className='text-xl font-bold text-white'>Budget Categories</h2>
            <p className='text-sm text-slate-400 mt-1'>Enable categories and set their monthly spending limits.</p>
          </div>
          <div className='px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm font-medium border border-slate-700'>
            {selectedCount} selected
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
          {categories.map((item) => (
            <div 
              key={item.category} 
              className={`p-5 rounded-xl border transition-all duration-200 ${item.enabled ? 'bg-slate-800/40 border-blue-500/30 shadow-[0_4px_24px_-8px_rgba(59,130,246,0.2)]' : 'bg-slate-900/30 border-slate-800/80 opacity-70'}`}
            >
              <label className='flex items-center gap-3 mb-5 cursor-pointer w-fit group'>
                <div className={`flex items-center justify-center w-5 h-5 rounded border ${item.enabled ? 'bg-blue-500 border-blue-500' : 'bg-slate-800 border-slate-600 group-hover:border-slate-500'} transition-colors`}>
                  {item.enabled && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                {/* Hidden native checkbox to keep functionality without native styling issues */}
                <input
                  type='checkbox'
                  className='hidden'
                  checked={item.enabled}
                  onChange={() => handleToggleCategory(item.category)}
                />
                <span className={`font-semibold text-sm ${item.enabled ? 'text-white' : 'text-slate-400'}`}>
                  {item.category} 
                  {item.category === 'Healthcare' && <span className='font-normal text-slate-500 ml-1'>(optional)</span>}
                </span>
              </label>

              <div className='flex flex-col gap-2'>
                <label className={`text-xs font-semibold uppercase tracking-wider ${item.enabled ? 'text-slate-400' : 'text-slate-600'}`}>Monthly Limit</label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-medium ${item.enabled ? 'text-slate-500' : 'text-slate-700'}`}>₹</span>
                  <input
                    className={`w-full bg-slate-950/50 border ${item.enabled ? 'border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'border-slate-800/50'} rounded-lg py-2.5 pl-8 pr-3 text-sm text-white transition-all outline-none`}
                    type='number'
                    disabled={!item.enabled}
                    min='0'
                    value={item.limit}
                    onChange={(event) => handleUpdateLimit(item.category, event.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='flex items-center justify-between mt-8 pt-6 border-t border-slate-800/60'>
          <span className='text-xs text-slate-500 max-w-sm'>
            Only selected categories will appear in your Budget Manager and analytics.
          </span>
          <div className='flex gap-4'>
            {!requiresSetup && (
              <button className='flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors' onClick={() => onNavigate?.('budget')}>
                Budget Manager
                <ArrowRight size={16} />
              </button>
            )}
            <button 
              className='flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(37,99,235,0.3)]' 
              disabled={saving} 
              onClick={handleSave}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
