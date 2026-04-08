import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload, Camera, CheckCircle, AlertCircle,
  Cpu, Tag, DollarSign, Building2, Calendar
} from 'lucide-react';
import { scanReceipt, getBudgetConfig, updateBudget } from '../api';
import { useToast } from '../ToastContext';
import { formatCurrency, getCurrencySymbol } from '../utils';

const PIPELINE_STAGES = [
  { label: 'Prepare\nImage', icon: '🖼️' },
  { label: 'Read\nText', icon: '🔍' },
  { label: 'Extract\nDetails', icon: '🧾' },
  { label: 'Categorize\nExpense', icon: '🏷️' },
  { label: 'Final\nCheck', icon: '✅' },
];

function PipelineIndicator({ stage }) {
  return (
    <div className="pipeline-steps" style={{ marginBottom: 28 }}>
      {PIPELINE_STAGES.map((s, i) => (
        <div key={i} className={`pipeline-step${i < stage ? ' done' : i === stage ? ' active' : ''}`}>
          <div className="pipeline-step-dot">
            {i < stage ? '✓' : i + 1}
          </div>
          <div className="pipeline-step-label">{s.label.split('\n').map((l, j) => <div key={j}>{l}</div>)}</div>
        </div>
      ))}
    </div>
  );
}

function ResultField({ label, value, icon: Icon }) {
  return (
    <div className="result-field">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} color="var(--primary-light)" />}
        <span className="result-field-label">{label}</span>
      </div>
      <span className="result-field-value">{value}</span>
    </div>
  );
}

export default function ScanPage() {
  const toast = useToast();
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(-1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [budgetPromptCat, setBudgetPromptCat] = useState(null);
  const [budgetInput, setBudgetInput] = useState('');
  const [budgetSaving, setBudgetSaving] = useState(false);

  const onDrop = useCallback((files) => {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  const runScan = async () => {
    if (!preview) return;
    setScanning(true);
    setResult(null);
    setError(null);
    setPipelineStage(0);

    try {
      // Simulate pipeline stage progression
      for (let i = 0; i < PIPELINE_STAGES.length; i++) {
        setPipelineStage(i);
        await new Promise(r => setTimeout(r, 350));
      }

      const b64 = preview.split(',')[1];
      const res = await scanReceipt(b64);
      setPipelineStage(PIPELINE_STAGES.length);
      setResult(res.data);
      toast('Receipt scanned successfully!', 'success');

      // Budget check logic
      const detectedCategory = res.data.ocr_result?.category;
      if (detectedCategory) {
        try {
          const configRes = await getBudgetConfig();
          const categoryConfig = configRes.data.categories.find(c => c.category === detectedCategory);
          // If the category is not enabled (meaning no budget is set)
          if (categoryConfig && !categoryConfig.enabled) {
            setBudgetPromptCat(detectedCategory);
          }
        } catch (e) {
          // ignore error to not block UI
        }
      }

    } catch (err) {
      const apiError = err?.response?.data?.error;
      const statusCode = err?.response?.status;
      const message = apiError
        ? `Scan failed (${statusCode || 'error'}): ${apiError}`
        : 'Failed to connect to backend API. Check frontend VITE_API_BASE_URL and backend server status.';
      setError(message);
      toast(apiError ? 'Scan failed' : 'Scan failed — backend unreachable', 'error');
      setPipelineStage(-1);
    } finally {
      setScanning(false);
    }
  };

  const confidence = result?.ocr_result?.confidence;
  const isAnomaly = result?.anomaly_detection?.is_anomaly;
  const sym = '₹';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Scan Receipt</h1>
        <p className="page-subtitle">Upload or drag a receipt image — we'll read the text and extract merchant, amounts, and category automatically</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Upload Panel */}
        <div className="flex-col" style={{ display: 'flex', gap: 20 }}>
          <div {...getRootProps()} className={`upload-zone${isDragActive ? ' drag-over' : ''}`}>
            <input {...getInputProps()} />
            {preview ? (
              <div>
                <img
                  src={preview}
                  alt="Receipt preview"
                  style={{ maxHeight: 280, maxWidth: '100%', borderRadius: 12, objectFit: 'contain', margin: '0 auto', display: 'block' }}
                />
                <p className="text-secondary text-sm mt-4">Click or drag to replace image</p>
              </div>
            ) : (
              <>
                <div className="upload-zone-icon">
                  <Upload size={32} color="var(--primary-light)" />
                </div>
                <div className="upload-zone-title">Drop your receipt here</div>
                <div className="upload-zone-sub">Supports JPG, PNG, WEBP — max 10MB</div>
                <div className="badge badge-primary" style={{ display: 'inline-flex', margin: '0 auto' }}>
                  <Camera size={11} /> Camera or File Upload
                </div>
              </>
            )}
          </div>

          <button
            className="btn btn-primary btn-lg w-full"
            onClick={runScan}
            disabled={!preview || scanning}
            style={{ justifyContent: 'center', opacity: (!preview || scanning) ? 0.6 : 1 }}
          >
            {scanning ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18 }} />
                Processing...
              </>
            ) : (
              <>
                <Cpu size={18} />
                Scan Receipt
              </>
            )}
          </button>


        </div>

        {/* Results Panel */}
        <div>
          {scanning && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <div className="spinner" />
                <span className="font-semibold">Processing receipt...</span>
              </div>
              <PipelineIndicator stage={pipelineStage} />
              <p className="text-secondary text-sm text-center">
                {PIPELINE_STAGES[pipelineStage]?.label.replace('\n', ' — ') || 'Initializing...'}
              </p>
            </div>
          )}

          {result && !scanning && (
            <div className="result-card">
              <div className="result-header">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={18} color="var(--success)" />
                    <span className="font-bold" style={{ fontSize: 16 }}>Extraction Complete</span>
                  </div>
                  <div className="text-xs text-muted">
                    Processed in {result.processing_time_ms}ms · {result.ocr_result?.ocr_engine}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: 22, fontWeight: 800,
                    background: 'linear-gradient(135deg, #10B981, #34D399)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                  }}>
                    {Math.round((confidence || 0) * 100)}%
                  </div>
                  <div className="text-xs text-muted">confidence</div>
                </div>
              </div>

              <div className="result-body">
                <PipelineIndicator stage={6} />

                <ResultField label="Merchant" value={result.ocr_result?.merchant} icon={Building2} />
                <ResultField label="Date" value={result.ocr_result?.date} icon={Calendar} />
                <ResultField label="Category" value={result.ocr_result?.category} icon={Tag} />
                <ResultField
                  label="Total Amount"
                  value={`${sym}${result.ocr_result?.total?.toFixed(2)}`}
                  icon={DollarSign}
                />
                <ResultField label="Tax" value={`${sym}${result.ocr_result?.tax?.toFixed(2)}`} icon={DollarSign} />

                {/* Line items */}
                {result.ocr_result?.items?.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div className="text-xs text-muted font-semibold mb-2" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Line Items
                    </div>
                    {result.ocr_result.items.map((item, i) => (
                      <div key={i} className="flex justify-between" style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                        <span className="text-secondary">{item.name} {item.qty > 1 && `× ${item.qty}`}</span>
                        <span className="font-semibold">{sym}{item.price?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Anomaly alert */}
                {isAnomaly && (
                  <div className="anomaly-alert" style={{ marginTop: 16 }}>
                    <AlertCircle size={18} color="var(--error)" style={{ flexShrink: 0 }} />
                    <div>
                      <div className="font-semibold text-error text-sm">Anomaly Detected</div>
                      <div className="text-xs text-muted">
                        This transaction is {result.anomaly_detection?.anomaly_score > 0.7 ? 'significantly' : 'slightly'} above your average spend
                        in {result.ocr_result?.category}. Avg: ₹{result.anomaly_detection?.avg_transaction_amount?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Classifier scores */}
                <div style={{ marginTop: 20 }}>
                  <div className="text-xs text-muted font-semibold mb-2" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Classifier Confidence
                  </div>
                  {Object.entries(result.classification?.all_scores || {})
                    .sort((a, b) => b[1] - a[1]).slice(0, 4)
                    .map(([cat, score]) => (
                      <div key={cat} className="flex items-center gap-2 mb-2" style={{ fontSize: 12 }}>
                        <span className="text-muted" style={{ width: 140, flexShrink: 0, truncate: true }}>{cat}</span>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className="progress-fill good" style={{ width: `${score * 100}%`, background: 'var(--primary)' }} />
                        </div>
                        <span className="font-semibold" style={{ width: 36, textAlign: 'right' }}>{Math.round(score * 100)}%</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)' }}>
              <div className="flex items-center gap-3">
                <AlertCircle size={20} color="var(--error)" />
                <div>
                  <div className="font-semibold text-error">Connection Failed</div>
                  <div className="text-sm text-muted mt-1">{error}</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-muted font-mono" style={{ background: 'var(--bg-elevated)', padding: '10px 12px', borderRadius: 8 }}>
                cd backend
                <br />
                pip install -r requirements.txt
                <br />
                alembic upgrade head
                <br />
                python app.py
              </div>
            </div>
          )}

          {!scanning && !result && !error && (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🧾</div>
              <div className="font-bold" style={{ fontSize: 18, marginBottom: 8 }}>Ready to Scan</div>
              <div className="text-secondary text-sm">
                Upload a receipt image and click "Scan Receipt" to extract financial data automatically.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Budget Prompt Pop-up */}
      {budgetPromptCat && (
        <div className="modal-overlay" onClick={() => !budgetSaving && setBudgetPromptCat(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">New Category Detected</div>
                <div className="text-sm text-muted mt-1">Set a monthly budget for {budgetPromptCat}</div>
              </div>
              <button className="modal-close" onClick={() => setBudgetPromptCat(null)}>✕</button>
            </div>
            <div style={{ padding: 20 }}>
              <p className="text-sm mb-4">We noticed you don't have a budget set for <strong>{budgetPromptCat}</strong> yet. Would you like to set one now to start tracking?</p>
              <div className="form-group mb-4">
                <label className="form-label">Monthly Budget Limit</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder={`e.g. 500`}
                  value={budgetInput}
                  onChange={e => setBudgetInput(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button className="btn btn-ghost" onClick={() => setBudgetPromptCat(null)}>Skip</button>
                <button 
                  className="btn btn-primary" 
                  disabled={!budgetInput || isNaN(budgetInput) || budgetSaving}
                  onClick={async () => {
                    setBudgetSaving(true);
                    try {
                        await updateBudget(budgetPromptCat, parseFloat(budgetInput));
                        toast('Budget updated successfully!', 'success');
                        setBudgetPromptCat(null);
                        setBudgetInput('');
                    } catch {
                        toast('Failed to set budget', 'error');
                    } finally {
                        setBudgetSaving(false);
                    }
                  }}
                >
                  {budgetSaving ? <div className="spinner" style={{width: 14, height: 14}}/> : 'Save Budget'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
