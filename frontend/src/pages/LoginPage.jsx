import { useState, useEffect, useRef } from 'react'
import {
  LogIn, UserPlus, ScanLine, Sparkles,
  ShieldCheck, Mail, Lock, User, Eye, EyeOff,
  BarChart3, Receipt, TrendingUp, ArrowRight, Check,
} from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../AuthContext'
import { useToast } from '../ToastContext'

/* ── Google G Icon ─────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
)

const FEATURES = [
  { icon: Receipt,    text: 'Scan & extract receipts instantly with OCR', color: '#3B82F6' },
  { icon: BarChart3,  text: 'Auto-categorise every expense with AI',        color: '#8B5CF6' },
  { icon: TrendingUp, text: '30-day AI-powered spending forecast',           color: '#10B981' },
  { icon: ShieldCheck,text: 'Bank-level encryption & GDPR compliant',        color: '#F59E0B' },
]

/* ── Animated floating particle ─────────────────────────────── */
function Particle({ style }) {
  return <div className="lp-particle" style={style} />
}

export default function LoginPage() {
  const { login, register, loginWithGoogle } = useAuth()
  const toast = useToast()

  const [mode, setMode]               = useState('login')
  const [submitting, setSubmitting]   = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [focusedField, setFocusedField] = useState(null)
  const [mounted, setMounted]         = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast('Email and password are required', 'error'); return }
    if (mode === 'register' && !form.name) { toast('Please enter your name', 'error'); return }
    setSubmitting(true)
    try {
      if (mode === 'register') {
        await register(form.name, form.email, form.password)
        toast('Account created! Welcome 🎉', 'success')
      } else {
        await login(form.email, form.password)
        toast('Welcome back!', 'success')
      }
    } catch (err) {
      toast(err?.response?.data?.error || 'Authentication failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = async (cr) => {
    if (!cr?.credential) { toast('Google login failed', 'error'); return }
    try {
      await loginWithGoogle(cr.credential)
      toast('Signed in with Google', 'success')
    } catch (err) {
      toast(err?.response?.data?.error || 'Google auth failed', 'error')
    }
  }

  /* Generate deterministic particles */
  const particles = Array.from({ length: 20 }, (_, i) => ({
    left:     `${(i * 37 + 11) % 100}%`,
    top:      `${(i * 53 + 7) % 100}%`,
    width:    `${2 + (i % 4)}px`,
    height:   `${2 + (i % 4)}px`,
    animationDelay: `${(i * 0.4) % 8}s`,
    animationDuration: `${6 + (i % 6)}s`,
    opacity: 0.15 + (i % 5) * 0.06,
  }))

  return (
    <div className="lp-root">
      {/* Animated background orbs */}
      <div className="lp-orb lp-orb-1" />
      <div className="lp-orb lp-orb-2" />
      <div className="lp-orb lp-orb-3" />
      <div className="lp-grid-overlay" />

      {/* Floating particles */}
      {particles.map((p, i) => <Particle key={i} style={p} />)}

      {/* ── Left panel — branding ─────────────────────────────── */}
      <div className={`lp-left ${mounted ? 'lp-left--in' : ''}`}>

        {/* Logo */}
        <div className="lp-logo">
          <div className="lp-logo-icon">
            <ScanLine size={24} color="white" />
            <div className="lp-logo-ring" />
          </div>
          <div>
            <div className="lp-logo-name">ReceiptAI</div>
            <div className="lp-logo-sub">Receipt Scanner · Budget Planner</div>
          </div>
        </div>

        {/* Headline */}
        <div className="lp-headline">
          <h2 className="lp-headline-title">
            Smart money<br />
            <span className="lp-gradient-text">starts here.</span>
          </h2>
          <p className="lp-headline-sub">
            Snap a receipt, let AI do the rest — categorised, forecasted,<br />and always under budget.
          </p>
        </div>

        {/* Feature list */}
        <div className="lp-features">
          {FEATURES.map(({ icon: Icon, text, color }, i) => (
            <div
              key={text}
              className="lp-feature"
              style={{ animationDelay: `${0.1 + i * 0.1}s` }}
            >
              <div className="lp-feature-icon" style={{ '--fc': color }}>
                <Icon size={16} color={color} />
              </div>
              <span className="lp-feature-text">{text}</span>
              <Check size={13} className="lp-feature-check" style={{ color }} />
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="lp-badges">
          {['EasyOCR Engine', 'AI Forecast', 'GDPR Safe', 'Free Plan'].map(b => (
            <span key={b} className="lp-badge">{b}</span>
          ))}
        </div>

        {/* Floating mock receipt card */}
        <div className="lp-mock-card">
          <div className="lp-mock-header">
            <Receipt size={13} color="#3B82F6" />
            <span>Starbucks · Coffee</span>
            <span className="lp-mock-amount">$6.40</span>
          </div>
          <div className="lp-mock-tag">
            <span className="lp-mock-dot" />
            Auto-categorised · Food & Drink
          </div>
        </div>
      </div>

      {/* ── Right panel — form ──────────────────────────────────── */}
      <div className="lp-right">
        <div className={`lp-card ${mounted ? 'lp-card--in' : ''}`}>

          {/* Mobile logo */}
          <div className="lp-mobile-logo">
            <div className="lp-logo-icon lp-logo-icon--sm">
              <ScanLine size={18} color="white" />
            </div>
            <span className="lp-logo-name">ReceiptAI</span>
          </div>

          {/* Heading */}
          <div className="lp-card-head">
            <h1 className="lp-card-title">
              {mode === 'login' ? 'Welcome back 👋' : 'Get started free'}
            </h1>
            <p className="lp-card-sub">
              {mode === 'login'
                ? 'Sign in to continue to your personal dashboard.'
                : 'Start tracking spend with AI-powered receipts.'}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="lp-tabs">
            <div className="lp-tabs-track">
              <div
                className="lp-tabs-thumb"
                style={{ transform: mode === 'register' ? 'translateX(100%)' : 'translateX(0)' }}
              />
              {[
                { id: 'login',    label: 'Sign In',   icon: LogIn },
                { id: 'register', label: 'Register',  icon: UserPlus },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`lp-tab ${mode === id ? 'lp-tab--active' : ''}`}
                  onClick={() => setMode(id)}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="lp-form">

            {mode === 'register' && (
              <div className={`lp-field ${focusedField === 'name' ? 'lp-field--focus' : ''}`}>
                <label className="lp-label">Full Name</label>
                <div className="lp-input-wrap">
                  <User size={15} className="lp-input-icon" />
                  <input
                    className="lp-input"
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className={`lp-field ${focusedField === 'email' ? 'lp-field--focus' : ''}`}>
              <label className="lp-label">Email Address</label>
              <div className="lp-input-wrap">
                <Mail size={15} className="lp-input-icon" />
                <input
                  className="lp-input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={`lp-field ${focusedField === 'password' ? 'lp-field--focus' : ''}`}>
              <div className="lp-field-row">
                <label className="lp-label">Password</label>
                {mode === 'login' && (
                  <span className="lp-forgot">Forgot password?</span>
                )}
              </div>
              <div className="lp-input-wrap">
                <Lock size={15} className="lp-input-icon" />
                <input
                  className="lp-input lp-input--pr"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Create a strong password' : 'Enter your password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="lp-eye-btn"
                  onClick={() => setShowPassword(p => !p)}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {mode === 'register' && (
                <div className="lp-hint">Use at least 8 characters with a mix of letters and numbers.</div>
              )}
            </div>

            {/* Submit */}
            <button
              className={`lp-submit ${submitting ? 'lp-submit--loading' : ''}`}
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="lp-spin" />
                  <span>Please wait...</span>
                </>
              ) : mode === 'register' ? (
                <>
                  <UserPlus size={16} />
                  <span>Create Account</span>
                  <ArrowRight size={15} className="lp-submit-arrow" />
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In</span>
                  <ArrowRight size={15} className="lp-submit-arrow" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="lp-divider">
            <div className="lp-divider-line" />
            <span className="lp-divider-text">or continue with</span>
            <div className="lp-divider-line" />
          </div>

          {/* Google button */}
          <div className="lp-google-wrap">
            <div className="lp-google-btn">
              <GoogleIcon />
              <span>Continue with Google</span>
            </div>
            <div className="lp-google-overlay">
              <GoogleLogin
                onSuccess={handleGoogle}
                onError={() => toast('Google authentication failed', 'error')}
                theme="filled_blue"
                shape="rectangular"
                size="large"
                width="420"
                text="continue_with"
              />
            </div>
          </div>

          {/* Trust footer */}
          <div className="lp-trust">
            <div className="lp-trust-item">
              <ShieldCheck size={12} color="#10B981" />
              <span>Your data is encrypted & stays private</span>
            </div>
            <div className="lp-trust-item">
              <Sparkles size={12} color="#3B82F6" />
              <span>OCR · Auto-categorisation · Budget insights</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── All styles scoped here ─────────────────────────────── */}
      <style>{`
        /* ─── Root layout ─────────────────────────────────── */
        .lp-root {
          min-height: 100vh;
          display: flex;
          position: relative;
          overflow: hidden;
          background: #050b18;
        }

        /* ─── Animated background orbs ───────────────────── */
        .lp-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: lp-orb-drift 12s ease-in-out infinite alternate;
        }
        .lp-orb-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%);
          top: -200px; left: -100px;
          animation-duration: 14s;
        }
        .lp-orb-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%);
          bottom: -150px; right: -80px;
          animation-duration: 10s;
          animation-direction: alternate-reverse;
        }
        .lp-orb-3 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation-duration: 18s;
        }
        @keyframes lp-orb-drift {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, 30px) scale(1.08); }
        }

        /* ─── Grid overlay ───────────────────────────────── */
        .lp-grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%);
        }

        /* ─── Particles ──────────────────────────────────── */
        .lp-particle {
          position: absolute;
          border-radius: 50%;
          background: rgba(99,149,255,0.6);
          animation: lp-float linear infinite;
          pointer-events: none;
        }
        @keyframes lp-float {
          0%   { transform: translateY(0) scale(1);    opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-120px) scale(0.6); opacity: 0; }
        }

        /* ─── Left panel ─────────────────────────────────── */
        .lp-left {
          flex: 0 0 46%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 56px;
          border-right: 1px solid rgba(255,255,255,0.05);
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: translateX(-24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .lp-left--in {
          opacity: 1;
          transform: translateX(0);
        }

        /* ─── Logo ───────────────────────────────────────── */
        .lp-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 56px;
        }
        .lp-logo-icon {
          width: 52px; height: 52px;
          border-radius: 16px;
          background: linear-gradient(135deg, #1D4ED8, #3B82F6);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 32px rgba(37,99,235,0.5), 0 0 0 1px rgba(59,130,246,0.3);
          position: relative;
          flex-shrink: 0;
        }
        .lp-logo-icon--sm {
          width: 40px; height: 40px;
          border-radius: 12px;
        }
        .lp-logo-ring {
          position: absolute;
          inset: -4px;
          border-radius: 20px;
          border: 1px solid rgba(59,130,246,0.25);
          animation: lp-ring-pulse 3s ease-in-out infinite;
        }
        @keyframes lp-ring-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.04); }
        }
        .lp-logo-name {
          font-size: 22px;
          font-weight: 800;
          color: #F1F5F9;
          letter-spacing: -0.3px;
        }
        .lp-logo-sub {
          font-size: 12px;
          color: #475569;
          font-weight: 500;
          margin-top: 1px;
        }

        /* ─── Headline ───────────────────────────────────── */
        .lp-headline { margin-bottom: 44px; }
        .lp-headline-title {
          font-size: 42px;
          font-weight: 900;
          line-height: 1.12;
          color: #F1F5F9;
          margin-bottom: 16px;
          letter-spacing: -1px;
        }
        .lp-gradient-text {
          background: linear-gradient(135deg, #3B82F6, #8B5CF6, #10B981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .lp-headline-sub {
          font-size: 15px;
          color: #64748B;
          line-height: 1.7;
        }

        /* ─── Features ───────────────────────────────────── */
        .lp-features {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 44px;
        }
        .lp-feature {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.02);
          backdrop-filter: blur(8px);
          transition: all 0.25s ease;
          animation: lp-slide-up 0.5s ease both;
        }
        .lp-feature:hover {
          border-color: rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          transform: translateX(4px);
        }
        @keyframes lp-slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-feature-icon {
          width: 34px; height: 34px;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(from var(--fc) r g b / 0.12);
          border: 1px solid rgba(from var(--fc) r g b / 0.25);
          flex-shrink: 0;
          background: color-mix(in srgb, var(--fc) 12%, transparent);
          border-color: color-mix(in srgb, var(--fc) 25%, transparent);
        }
        .lp-feature-text {
          flex: 1;
          font-size: 13.5px;
          color: #CBD5E1;
          font-weight: 500;
        }
        .lp-feature-check { flex-shrink: 0; }

        /* ─── Badges ─────────────────────────────────────── */
        .lp-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 36px;
        }
        .lp-badge {
          padding: 5px 13px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          color: #64748B;
          letter-spacing: 0.3px;
        }

        /* ─── Mock receipt card ──────────────────────────── */
        .lp-mock-card {
          background: rgba(26,34,54,0.7);
          border: 1px solid rgba(37,99,235,0.22);
          border-radius: 14px;
          padding: 14px 16px;
          backdrop-filter: blur(12px);
          animation: lp-card-bob 4s ease-in-out infinite;
          max-width: 280px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        @keyframes lp-card-bob {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
        .lp-mock-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #E2E8F0;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .lp-mock-amount {
          margin-left: auto;
          color: #3B82F6;
        }
        .lp-mock-tag {
          font-size: 11px;
          color: #10B981;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .lp-mock-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 6px #10B981;
        }

        /* ─── Right panel ────────────────────────────────── */
        .lp-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          position: relative;
          z-index: 1;
        }

        /* ─── Card ───────────────────────────────────────── */
        .lp-card {
          width: 100%;
          max-width: 440px;
          background: rgba(15,22,40,0.75);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 36px 36px 32px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 24px 64px rgba(0,0,0,0.6),
            0 0 80px rgba(37,99,235,0.06);
          opacity: 0;
          transform: translateY(24px) scale(0.97);
          transition: opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s;
        }
        .lp-card--in {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* ─── Mobile logo ────────────────────────────────── */
        .lp-mobile-logo {
          display: none;
          align-items: center;
          gap: 12px;
          justify-content: center;
          margin-bottom: 28px;
        }

        /* ─── Card header ────────────────────────────────── */
        .lp-card-head { margin-bottom: 26px; }
        .lp-card-title {
          font-size: 28px;
          font-weight: 800;
          color: #F1F5F9;
          margin-bottom: 6px;
          letter-spacing: -0.5px;
        }
        .lp-card-sub {
          font-size: 14px;
          color: #94A3B8;
          line-height: 1.55;
        }

        /* ─── Tabs ───────────────────────────────────────── */
        .lp-tabs { margin-bottom: 26px; }
        .lp-tabs-track {
          display: flex;
          position: relative;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 4px;
          gap: 2px;
        }
        .lp-tabs-thumb {
          position: absolute;
          top: 4px; bottom: 4px;
          width: calc(50% - 5px);
          border-radius: 11px;
          background: linear-gradient(135deg, #1D4ED8, #3B82F6);
          box-shadow: 0 4px 16px rgba(37,99,235,0.4);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          left: 4px;
        }
        .lp-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 0;
          border-radius: 11px;
          border: none;
          background: transparent;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          position: relative;
          z-index: 1;
          transition: color 0.25s ease;
          color: #64748B;
          font-family: inherit;
        }
        .lp-tab--active { color: #ffffff; }
        .lp-tab:not(.lp-tab--active):hover { color: #94A3B8; }

        /* ─── Form ───────────────────────────────────────── */
        .lp-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .lp-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .lp-field-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .lp-label {
          font-size: 13px;
          font-weight: 600;
          color: #94A3B8;
          letter-spacing: 0.1px;
        }
        .lp-forgot {
          font-size: 12px;
          color: #3B82F6;
          cursor: pointer;
          font-weight: 600;
          transition: color 0.2s;
        }
        .lp-forgot:hover { color: #60A5FA; }

        .lp-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .lp-input-icon {
          position: absolute;
          left: 14px;
          color: #475569;
          pointer-events: none;
          transition: color 0.2s;
          flex-shrink: 0;
        }
        .lp-field--focus .lp-input-icon { color: #3B82F6; }
        .lp-input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          color: #F1F5F9;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
        }
        .lp-input::placeholder { color: #334155; }
        .lp-input:focus {
          border-color: rgba(59,130,246,0.5);
          background: rgba(37,99,235,0.06);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
        }
        .lp-input--pr { padding-right: 44px; }
        .lp-eye-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: #475569;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .lp-eye-btn:hover { color: #94A3B8; }
        .lp-hint {
          font-size: 11px;
          color: #475569;
          margin-top: 2px;
        }

        /* ─── Submit button ──────────────────────────────── */
        .lp-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 14px 0;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%);
          color: white;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          margin-top: 4px;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 4px 20px rgba(37,99,235,0.45),
            0 0 0 1px rgba(59,130,246,0.3) inset;
          transition: all 0.25s ease;
          letter-spacing: 0.1px;
        }
        .lp-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .lp-submit:hover:not(:disabled)::before { opacity: 1; }
        .lp-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(37,99,235,0.55);
        }
        .lp-submit:active:not(:disabled) { transform: translateY(0); }
        .lp-submit:disabled { opacity: 0.65; cursor: not-allowed; }
        .lp-submit-arrow {
          transition: transform 0.25s;
        }
        .lp-submit:hover .lp-submit-arrow { transform: translateX(3px); }

        /* ─── Spinner ────────────────────────────────────── */
        .lp-spin {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: lp-spin 0.6s linear infinite;
          flex-shrink: 0;
        }
        @keyframes lp-spin { to { transform: rotate(360deg); } }

        /* ─── Divider ─────────────────────────────────────── */
        .lp-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0;
        }
        .lp-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }
        .lp-divider-text {
          font-size: 12px;
          color: #475569;
          font-weight: 500;
          white-space: nowrap;
        }

        /* ─── Google button ──────────────────────────────── */
        .lp-google-wrap {
          position: relative;
          width: 100%;
        }
        .lp-google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 13px 0;
          border-radius: 14px;
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 14px;
          font-weight: 600;
          color: #E2E8F0;
          cursor: pointer;
          user-select: none;
          transition: all 0.25s;
        }
        .lp-google-btn:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.16);
        }
        .lp-google-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.001;
          overflow: hidden;
          border-radius: 14px;
        }

        /* ─── Trust footer ───────────────────────────────── */
        .lp-trust {
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .lp-trust-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #475569;
        }

        /* ─── Responsive ─────────────────────────────────── */
        @media (max-width: 900px) {
          .lp-left { display: none !important; }
          .lp-mobile-logo { display: flex !important; }
          .lp-card { padding: 28px 24px 24px; }
        }
        @media (max-width: 480px) {
          .lp-right { padding: 24px 16px; }
          .lp-card-title { font-size: 24px; }
        }
      `}</style>
    </div>
  )
}
