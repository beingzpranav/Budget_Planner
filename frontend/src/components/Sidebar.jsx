import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ScanLine, Wallet, BarChart3,
  AlertTriangle, Settings, TrendingUp, Receipt, LogOut
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'scan',      label: 'Scan',          icon: ScanLine },
  { id: 'expenses',  label: 'Expenses',      icon: Receipt },
  { id: 'budget',    label: 'Budget',        icon: Wallet },
  { id: 'analytics', label: 'Analytics',     icon: BarChart3 },
  { id: 'forecast',  label: 'Forecast',      icon: TrendingUp },
  { id: 'anomalies', label: 'Alerts',        icon: AlertTriangle },
  { id: 'settings',  label: 'Settings',      icon: Settings },
];

export default function Sidebar({ active, onChange, user, onLogout, requiresBudgetSetup }) {
  const visibleItems = requiresBudgetSetup ? [{ id: 'settings', label: 'Settings', icon: Settings }] : NAV_ITEMS;
  
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });
  const containerRef = useRef(null);

  // Auto-update cursor position based on active item
  useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.querySelector(`[data-id="${active}"]`);
    if (activeEl) {
      const { width } = activeEl.getBoundingClientRect();
      setPosition({ width, opacity: 1, left: activeEl.offsetLeft });
    }
  }, [active, visibleItems]);

  return (
    <header className="topbar" style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
      <ul
        ref={containerRef}
        className="relative mx-auto flex w-fit rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] p-1 shadow-lg backdrop-blur-md"
        onMouseLeave={() => {
          // Snap back to active on mouse leave
          const activeEl = containerRef.current?.querySelector(`[data-id="${active}"]`);
          if (activeEl) {
             setPosition({ width: activeEl.getBoundingClientRect().width, opacity: 1, left: activeEl.offsetLeft });
          }
        }}
        style={{ flexWrap: 'wrap', justifyContent: 'center' }}
      >
        {visibleItems.map(({ id, label, icon: Icon }) => (
          <Tab 
            key={id} id={id} active={active === id}
            onClick={() => onChange(id)} setPosition={setPosition}
          >
            <Icon className="mr-2 inline-block h-4 w-4" />
            <span className="hidden md:inline-block">{label}</span>
          </Tab>
        ))}

        {/* Logout Tab */}
        <Tab id="logout" active={false} onClick={onLogout} setPosition={setPosition}>
          <LogOut className="inline-block h-4 w-4 text-red-400" />
        </Tab>

        <Cursor position={position} />
      </ul>
    </header>
  );
}

const Tab = ({ id, children, active, onClick, setPosition }) => {
  const ref = useRef(null);
  return (
    <li
      ref={ref}
      data-id={id}
      onClick={onClick}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({ width, opacity: 1, left: ref.current.offsetLeft });
      }}
      className={`relative z-10 block cursor-pointer px-3 py-2 text-xs font-medium transition-colors md:px-5 md:py-2.5 md:text-sm ${
        active ? 'text-white' : 'text-[var(--text-secondary)] hover:text-white'
      }`}
    >
      {children}
    </li>
  );
};

const Cursor = ({ position }) => {
  return (
    <motion.li
      animate={position}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="absolute z-0 h-8 rounded-full bg-[var(--primary)] md:h-10 shadow-[0_0_12px_rgba(59,130,246,0.6)]"
    />
  );
};
