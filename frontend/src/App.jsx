import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Hand, Activity, BookOpen, Type, Camera, Brain, Menu, X } from 'lucide-react';
import Dashboard     from './pages/Dashboard';
import Interpreter   from './pages/Interpreter';
import Learn         from './pages/Learn';
import SignPlayer    from './pages/SignPlayer';
import DataCollection from './pages/DataCollection';
import Training      from './pages/Training';

const NAV = [
  { to: '/interpret', label: 'Interpret' },
  { to: '/learn',     label: 'Learn ASL' },
  { to: '/sign',      label: 'Sign Player' },
  { to: '/collect',   label: 'Collect' },
  { to: '/train',     label: 'Train' },
];

function NavLink({ to, label, onClick }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link to={to} onClick={onClick}
      style={{
        color: active ? '#fff' : 'rgba(255,255,255,0.55)',
        fontSize: '0.78rem',
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding: '6px 14px',
        borderRadius: '9999px',
        background: active ? 'rgba(124,58,237,0.35)' : 'transparent',
        border: active ? '1px solid rgba(124,58,237,0.5)' : '1px solid transparent',
        transition: 'all 0.2s',
        textDecoration: 'none',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.color='#fff'; e.currentTarget.style.background='rgba(255,255,255,0.06)'; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.color='rgba(255,255,255,0.55)'; e.currentTarget.style.background='transparent'; }}}
    >
      {label}
    </Link>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      <nav style={{
        position: 'fixed', top: '18px', left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 16px 8px 12px',
        borderRadius: '9999px',
        background: scrolled ? 'rgba(2,1,15,0.85)' : 'rgba(2,1,15,0.45)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.5)' : 'none',
        transition: 'background 0.3s, box-shadow 0.3s',
        whiteSpace: 'nowrap',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:'8px', textDecoration:'none', marginRight:'8px' }}>
          <div style={{
            width:28, height:28, borderRadius:'8px',
            background:'linear-gradient(135deg,#7c3aed,#06b6d4)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 12px rgba(124,58,237,0.6)',
          }}>
            <Hand size={14} color="#fff" />
          </div>
          <span style={{
            fontFamily:"'Bebas Neue',sans-serif",
            fontSize:'1.15rem',
            letterSpacing:'0.06em',
            background:'linear-gradient(90deg,#a78bfa,#67e8f9)',
            WebkitBackgroundClip:'text',
            WebkitTextFillColor:'transparent',
          }}>SignLang AI</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-1">
          {NAV.map(n => <NavLink key={n.to} {...n} />)}
        </div>

        {/* Mobile burger */}
        <button
          className="sm:hidden"
          onClick={() => setOpen(o => !o)}
          style={{ color:'rgba(255,255,255,0.7)', background:'none', border:'none', cursor:'pointer', padding:'4px' }}>
          {open ? <X size={18}/> : <Menu size={18}/>}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div style={{
          position:'fixed', top:'72px', left:'50%', transform:'translateX(-50%)',
          zIndex:99, width:'220px',
          background:'rgba(2,1,15,0.95)', border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:'16px', padding:'8px',
          backdropFilter:'blur(20px)', boxShadow:'0 8px 40px rgba(0,0,0,0.6)',
        }}>
          {NAV.map(n => (
            <NavLink key={n.to} {...n} onClick={() => setOpen(false)} />
          ))}
        </div>
      )}
    </>
  );
}

function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div style={{ minHeight:'100vh', background:'var(--void)', color:'#fff' }}>
      <Nav />
      <main style={isHome ? {} : { paddingTop:'80px', maxWidth:'1280px', margin:'0 auto', padding:'96px 24px 48px' }}>
        <Routes>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/interpret" element={<Interpreter />} />
          <Route path="/learn"    element={<Learn />} />
          <Route path="/sign"     element={<SignPlayer />} />
          <Route path="/collect"  element={<DataCollection />} />
          <Route path="/train"    element={<Training />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
