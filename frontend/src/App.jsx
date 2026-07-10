import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Hand, Menu, X } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Interpreter from './pages/Interpreter';
import Learn from './pages/Learn';
import SignPlayer from './pages/SignPlayer';

const NAV = [
  { to: '/interpret', label: 'Interpreter' },
  { to: '/learn', label: 'Learn' },
  { to: '/sign', label: 'Sign Player' },
];

function NavLink({ to, label, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link to={to} onClick={onClick} style={{
      display: 'flex', alignItems: 'center',
      minHeight: 44, padding: '0 14px',
      borderRadius: 8,
      fontSize: '0.9rem',
      fontWeight: active ? 600 : 400,
      color: active ? 'var(--text)' : 'var(--text-2)',
      background: active ? 'var(--accent-soft)' : 'transparent',
      textDecoration: 'none',
      transition: 'color 0.15s ease, background 0.15s ease',
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-2)'; }}
    >{label}</Link>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(11,12,14,0.85)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <nav style={{
        maxWidth: 1080, margin: '0 auto', padding: '0 24px',
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--chrome)',
            border: '1px solid #878d96',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Hand size={16} color="#121316" />
          </div>
          <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text)' }}>SignLang</span>
        </Link>

        {/* Desktop links */}
        <div className="nav-desktop">
          {NAV.map(n => <NavLink key={n.to} {...n} />)}
        </div>

        {/* Mobile burger */}
        <button className="nav-burger" onClick={() => setOpen(o => !o)} aria-label="Menu" style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text)', width: 44, height: 44,
          alignItems: 'center', justifyContent: 'center',
        }}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="nav-mobile" style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
          padding: '8px 16px 16px',
          flexDirection: 'column', gap: 4,
        }}>
          {NAV.map(n => <NavLink key={n.to} {...n} onClick={() => setOpen(false)} />)}
        </div>
      )}
    </header>
  );
}

function Layout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav />
      <main style={{ flex: 1, width: '100%', maxWidth: 1080, margin: '0 auto', padding: '40px 24px 80px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/interpret" element={<Interpreter />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/sign" element={<SignPlayer />} />
        </Routes>
      </main>
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '20px 24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-3)',
      }}>
        SignLang — recognition runs on your device. No video leaves your browser.
      </footer>
    </div>
  );
}

export default function App() {
  return <Router><Layout /></Router>;
}
