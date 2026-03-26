import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroBackground from '../components/HeroBackground';
import { Activity, BookOpen, Type, Camera, ArrowRight, ChevronDown } from 'lucide-react';

const SECTIONS = [
  {
    num: '01', tag: 'INTERPRET',
    headline: 'LIVE SIGN\nRECOGNITION',
    body: 'Point your camera at your hands. The AI reads every gesture in real time, builds sentences, and speaks them aloud — zero delay.',
    cta: 'Open Interpreter', to: '/interpret',
    icon: Activity, accent: '#7c3aed',
    align: 'left',
  },
  {
    num: '02', tag: 'LEARN',
    headline: 'MASTER THE\nALPHABET',
    body: 'Animated ASL reference cards for every letter and number. Study at your own pace, then test yourself in quiz mode.',
    cta: 'Start Learning', to: '/learn',
    icon: BookOpen, accent: '#06b6d4',
    align: 'right',
  },
  {
    num: '03', tag: 'COMMUNICATE',
    headline: 'TEXT TO\nHAND SIGNS',
    body: 'Type any sentence and watch the animated ASL dictionary play it back, letter by letter, at your chosen speed.',
    cta: 'Try Sign Player', to: '/sign',
    icon: Type, accent: '#8b5cf6',
    align: 'left',
  },
  {
    num: '04', tag: 'TRAIN AI',
    headline: 'TEACH YOUR\nOWN SIGNS',
    body: 'Record custom gestures with one click, train a personal ML model in seconds, and get instant recognition feedback.',
    cta: 'Collect & Train', to: '/collect',
    icon: Camera, accent: '#7c3aed',
    align: 'right',
  },
];

function useScrollProgress() {
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const fn = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProg(max > 0 ? window.scrollY / max : 0);
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return prog;
}

function ScrollHUD({ progress }) {
  const pct = Math.round(progress * 100);
  const r = 14, circ = 2 * Math.PI * r;
  return (
    <div style={{
      position: 'fixed', right: '24px', bottom: '32px', zIndex: 50,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
    }}>
      <svg width="36" height="36" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
        <circle cx="18" cy="18" r={r} fill="none" stroke="#7c3aed" strokeWidth="2"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
          style={{ transition: 'stroke-dashoffset 0.1s' }} strokeLinecap="round" />
      </svg>
      <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>{pct}%</span>
    </div>
  );
}

function Section({ s, index }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.18 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const isRight = s.align === 'right';
  const accentRGB = s.accent === '#7c3aed' ? '124,58,237' : s.accent === '#06b6d4' ? '6,182,212' : '139,92,246';

  return (
    <div ref={ref} style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: isRight ? 'flex-end' : 'flex-start',
      padding: '80px clamp(24px, 8vw, 140px)',
      position: 'relative',
    }}>
      {/* vertical section label */}
      <div style={{
        position: 'absolute',
        [isRight ? 'left' : 'right']: 'clamp(16px,4vw,60px)',
        top: '50%', transform: 'translateY(-50%)',
        writingMode: 'vertical-rl',
        fontSize: '0.65rem',
        letterSpacing: '0.2em',
        color: 'rgba(255,255,255,0.18)',
        textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <span style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.12)', display: 'block' }} />
        {s.tag}
        <span style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.12)', display: 'block' }} />
      </div>

      {/* ghost number */}
      <div style={{
        fontFamily: "'Bebas Neue',sans-serif",
        fontSize: 'clamp(5rem,15vw,10rem)',
        lineHeight: 1,
        color: s.accent,
        opacity: 0.08,
        position: 'absolute',
        top: '50%', transform: 'translateY(-50%)',
        [isRight ? 'right' : 'left']: 'clamp(24px,6vw,100px)',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>{s.num}</div>

      {/* card */}
      <div style={{
        maxWidth: '560px', position: 'relative',
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.97)',
        transition: `opacity 0.8s ${index * 0.05}s ease, transform 0.8s ${index * 0.05}s ease`,
      }}>
        {/* tag line */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: s.accent, marginBottom: '20px',
        }}>
          <div style={{ width: '24px', height: '1px', background: s.accent }} />
          {s.tag}
        </div>

        {/* headline */}
        <h2 style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 'clamp(3rem,7vw,5.5rem)',
          lineHeight: 0.9,
          letterSpacing: '0.02em',
          marginBottom: '24px',
          whiteSpace: 'pre-line',
        }}>{s.headline}</h2>

        {/* body */}
        <p style={{
          color: 'rgba(255,255,255,0.55)',
          fontSize: '1rem', lineHeight: 1.65,
          marginBottom: '36px', maxWidth: '420px',
          fontFamily: "'Space Grotesk',sans-serif",
        }}>{s.body}</p>

        {/* CTA */}
        <Link to={s.to} style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          padding: '12px 28px', borderRadius: '9999px',
          border: `1px solid ${s.accent}`,
          color: '#fff', fontSize: '0.82rem',
          letterSpacing: '0.08em', textTransform: 'uppercase',
          textDecoration: 'none',
          background: `rgba(${accentRGB},0.12)`,
          transition: 'all 0.25s',
          boxShadow: `0 0 20px rgba(${accentRGB},0.12)`,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = `rgba(${accentRGB},0.25)`; e.currentTarget.style.boxShadow = `0 0 30px rgba(${accentRGB},0.4)`; }}
          onMouseLeave={e => { e.currentTarget.style.background = `rgba(${accentRGB},0.12)`; e.currentTarget.style.boxShadow = `0 0 20px rgba(${accentRGB},0.12)`; }}
        >
          {s.cta}
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const progress = useScrollProgress();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch('/api/status').then(r => r.json()).then(setStatus).catch(() => {});
  }, []);

  const modelReady = status?.model_loaded;

  return (
    <div style={{ marginTop: '-80px' }}>
      <ScrollHUD progress={progress} />

      {/* ── Hero ── */}
      <section style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <HeroBackground />

        {/* Status pill */}
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 16px', borderRadius: '9999px',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '40px',
          fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase',
          color: modelReady ? '#34d399' : 'rgba(255,255,255,0.4)',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: modelReady ? '#34d399' : 'rgba(255,255,255,0.3)',
            boxShadow: modelReady ? '0 0 8px #34d39980' : 'none',
          }} />
          {status === null ? 'Connecting…' : modelReady ? 'AI Model Ready' : 'No Model — Collect data to begin'}
        </div>

        {/* Main headline */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px' }}>
          <h1 className="display animate-fadeUp" style={{
            fontSize: 'clamp(6rem,22vw,18rem)',
            lineHeight: 0.88,
            letterSpacing: '0.02em',
            background: 'linear-gradient(180deg, #ffffff 0%, rgba(180,150,255,0.9) 60%, rgba(124,58,237,0.5) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 60px rgba(124,58,237,0.45))',
          }}>
            SIGN
          </h1>

          <p className="animate-fadeUp" style={{
            marginTop: '8px',
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 'clamp(0.75rem,2vw,1rem)',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)',
            animationDelay: '0.25s',
          }}>
            Language &nbsp;·&nbsp; Intelligence &nbsp;·&nbsp; Communication
          </p>
        </div>

        {/* Scroll cue */}
        <div style={{
          position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase',
          animation: 'floatY 2.5s ease-in-out infinite',
        }}>
          scroll
          <ChevronDown size={14} />
        </div>
      </section>

      {/* ── Scroll sections ── */}
      <div style={{ position: 'relative', background: 'var(--void)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)' }} />
        {SECTIONS.map((s, i) => <Section key={s.num} s={s} index={i} />)}
      </div>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '32px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px',
        color: 'rgba(255,255,255,0.2)',
        fontSize: '0.72rem', letterSpacing: '0.1em',
      }}>
        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)' }}>
          SIGNLANG AI
        </span>
        <span>MediaPipe · RandomForest · React · Vite</span>
      </footer>
    </div>
  );
}
