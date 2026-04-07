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

      <div className='card'>
        <div className='flex items-center justify-between mb-4'>
          <span className='font-semibold'>Budget Categories</span>
          <span className='text-muted'>{selectedCount} selected</span>
        </div>
        <div className='grid-auto'>
          {categories.map((item) => (
            <div key={item.category} className='card'>
              <label className='flex items-center gap-3 mb-3'>
                <input
                  type='checkbox'
                  checked={item.enabled}
                  onChange={() => handleToggleCategory(item.category)}
                />
                <span className='font-semibold'>{item.category}</span>
                {item.category === 'Healthcare' ? (
                  <span className='text-muted'>(optional)</span>
                ) : null}
              </label>
              <div className='flex items-center gap-2'>
                <span className='text-muted'>Monthly limit</span>
                <input
                  className='form-input'
                  type='number'
                  disabled={!item.enabled}
                  min='0'
                  value={item.limit}
                  onChange={(event) =>
                    handleUpdateLimit(item.category, event.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <div className='flex justify-end mt-5'>
          <button className='btn btn-primary' disabled={saving} onClick={handleSave}>
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Budget Settings'}
          </button>
        </div>
        <div className='text-xs text-muted mt-4'>
          Only selected categories will appear in Budget Manager and analytics.
        </div>
      </div>
      {!requiresSetup ? (
        <div className='flex justify-end mt-4'>
          <button className='btn btn-secondary' onClick={() => onNavigate?.('budget')}>
            Go to Budget Manager
            <ArrowRight size={14} />
          </button>
        </div>
      ) : null}
    </div>
  )
}
