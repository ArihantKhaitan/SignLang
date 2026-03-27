import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Hand, Menu, X } from 'lucide-react';
import HeroBackground from './components/HeroBackground';
import Dashboard  from './pages/Dashboard';
import Interpreter from './pages/Interpreter';
import Learn       from './pages/Learn';
import SignPlayer  from './pages/SignPlayer';

const NAV = [
  { to: '/interpret', label: 'Interpreter' },
  { to: '/learn',     label: 'Learn ASL'  },
  { to: '/sign',      label: 'Sign Player'},
];

function NavLink({ to, label, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link to={to} onClick={onClick} style={{
      color: active ? '#fff' : 'rgba(255,255,255,0.5)',
      fontSize: '0.75rem', fontWeight: 500,
      letterSpacing: '0.1em', textTransform: 'uppercase',
      padding: '6px 16px', borderRadius: 9999,
      background: active ? 'rgba(124,58,237,0.35)' : 'transparent',
      border: `1px solid ${active ? 'rgba(124,58,237,0.55)' : 'transparent'}`,
      textDecoration: 'none', transition: 'all 0.2s',
      boxShadow: active ? '0 0 16px rgba(124,58,237,0.3)' : 'none',
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'transparent'; }}}
    >{label}</Link>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 200, display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px 7px 10px', borderRadius: 9999,
        background: scrolled ? 'rgba(1,0,10,0.92)' : 'rgba(1,0,10,0.55)',
        border: '1px solid rgba(255,255,255,0.09)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        boxShadow: scrolled ? '0 8px 40px rgba(0,0,0,0.6)' : '0 2px 20px rgba(0,0,0,0.3)',
        transition: 'all 0.3s',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: 'linear-gradient(135deg,#7c3aed 0%,#06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(124,58,237,0.7)',
          }}>
            <Hand size={15} color="#fff" />
          </div>
          <span style={{
            fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.1rem', letterSpacing: '0.08em',
            background: 'linear-gradient(90deg,#a78bfa,#67e8f9)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>SignLang AI</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-1">
          {NAV.map(n => <NavLink key={n.to} {...n} />)}
        </div>

        {/* Mobile burger */}
        <button className="sm:hidden" onClick={() => setOpen(o => !o)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(255,255,255,0.7)', padding: 4,
        }}>
          {open ? <X size={17} /> : <Menu size={17} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div style={{
          position: 'fixed', top: 68, left: '50%', transform: 'translateX(-50%)',
          zIndex: 199, width: 200, padding: 8,
          background: 'rgba(1,0,10,0.97)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 18, backdropFilter: 'blur(24px)',
          boxShadow: '0 16px 60px rgba(0,0,0,0.7)',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {NAV.map(n => <NavLink key={n.to} {...n} onClick={() => setOpen(false)} />)}
        </div>
      )}
    </>
  );
}

function InnerPageBg() {
  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: '#000308' }} />
      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      {/* Violet glow top-left */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: '50vw', height: '50vh',
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)',
      }} />
      {/* Cyan glow bottom-right */}
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: '40vw', height: '40vh',
        background: 'radial-gradient(ellipse, rgba(6,182,212,0.06) 0%, transparent 70%)',
      }} />
    </div>
  );
}

function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  return (
    <div style={{ minHeight: '100vh', color: '#fff', position: 'relative' }}>
      {isHome ? <HeroBackground /> : <InnerPageBg />}
      <Nav />
      <main style={isHome
        ? { position: 'relative', zIndex: 1 }
        : { position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '90px 24px 60px' }
      }>
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/interpret" element={<Interpreter />} />
          <Route path="/learn"     element={<Learn />} />
          <Route path="/sign"      element={<SignPlayer />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return <Router><Layout /></Router>;
}
