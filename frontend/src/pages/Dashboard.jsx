import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/* ─── Scroll progress hook ───────────────────────────────────────── */
function useScroll() {
  const [pct, setPct] = useState(0);
  const [section, setSection] = useState(0);
  useEffect(() => {
    const fn = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      setPct(p);
      // which section are we in? (0 = hero, 1-4 = content)
      const vh = window.innerHeight;
      setSection(Math.floor(window.scrollY / vh));
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return { pct, section };
}

/* ─── Scroll progress ring HUD (bottom-right) ───────────────────── */
function ProgressHUD({ pct, section, total }) {
  const r = 16, circ = 2 * Math.PI * r;
  return (
    <div style={{
      position: 'fixed', right: 28, bottom: 32, zIndex: 90,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    }}>
      <svg width="40" height="40" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2" />
        <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(124,58,237,0.9)" strokeWidth="2"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 0.12s' }} strokeLinecap="round" />
      </svg>
      <span style={{ fontSize: '0.58rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.28)' }}>
        {String(Math.min(section, total)).padStart(2, '0')}/{String(total).padStart(2, '0')}
      </span>
    </div>
  );
}

/* ─── Left sidebar (vertical label + dots) ───────────────────────── */
function SidebarHUD({ section, labels }) {
  return (
    <div style={{
      position: 'fixed', left: 28, top: '50%', transform: 'translateY(-50%)',
      zIndex: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    }}>
      {labels.map((lbl, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: section === i + 1 ? '#7c3aed' : 'rgba(255,255,255,0.18)',
            boxShadow: section === i + 1 ? '0 0 8px rgba(124,58,237,0.8)' : 'none',
            transition: 'all 0.3s',
          }} />
        </div>
      ))}
      {/* vertical label */}
      <div style={{
        writingMode: 'vertical-rl', fontSize: '0.6rem', letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginTop: 6,
      }}>
        {labels[section - 1] || 'HORIZON'}
      </div>
    </div>
  );
}

/* ─── Section data ───────────────────────────────────────────────── */
const SECTIONS = [
  {
    num: '01', tag: 'INTERPRET', accent: '#7c3aed',
    headline: 'LIVE SIGN\nRECOGNITION',
    body: 'Point your camera at your hands. The AI reads every gesture in real time, builds full sentences, and speaks them aloud — zero delay.',
    cta: 'Open Interpreter', to: '/interpret',
  },
  {
    num: '02', tag: 'LEARN', accent: '#06b6d4',
    headline: 'MASTER THE\nALPHABET',
    body: 'Animated ASL reference cards for every letter and number. Study at your own pace, then put yourself to the test in quiz mode.',
    cta: 'Start Learning', to: '/learn',
  },
  {
    num: '03', tag: 'COMMUNICATE', accent: '#8b5cf6',
    headline: 'TEXT TO\nHAND SIGNS',
    body: 'Type any sentence and watch the animated ASL dictionary play it back, letter by letter, at your chosen speed.',
    cta: 'Try Sign Player', to: '/sign',
  },
  {
    num: '04', tag: 'TRAIN AI', accent: '#7c3aed',
    headline: 'TEACH YOUR\nOWN SIGNS',
    body: 'Record custom gestures with one click, train a personal ML model in seconds, and get instant live recognition feedback.',
    cta: 'Collect & Train', to: '/collect',
  },
];

/* ─── Single content section ─────────────────────────────────────── */
function ContentSection({ s, index }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  const isRight = index % 2 === 1;
  const rgb = s.accent === '#7c3aed' ? '124,58,237' : s.accent === '#06b6d4' ? '6,182,212' : '139,92,246';

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isRight ? 'flex-end' : 'flex-start',
        padding: '0 clamp(60px, 10vw, 180px)',
      }}
    >
      {/* Ghost section number */}
      <div style={{
        position: 'absolute',
        [isRight ? 'left' : 'right']: 'clamp(20px,5vw,80px)',
        bottom: '8%',
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 'clamp(8rem, 22vw, 18rem)',
        lineHeight: 1,
        color: s.accent,
        opacity: 0.06,
        pointerEvents: 'none',
        userSelect: 'none',
      }}>{s.num}</div>

      {/* Content card */}
      <div style={{
        maxWidth: 540,
        opacity: vis ? 1 : 0,
        transform: vis
          ? 'translateY(0) scale(1)'
          : `translateY(50px) scale(0.97)`,
        transition: `opacity 0.9s ease, transform 0.9s ease`,
      }}>
        {/* Tag line */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          fontSize: '0.68rem', letterSpacing: '0.24em', textTransform: 'uppercase',
          color: s.accent, marginBottom: 18,
        }}>
          <span style={{ display: 'block', width: 28, height: 1, background: s.accent }} />
          {s.num} — {s.tag}
        </div>

        {/* Headline */}
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(3.2rem, 7.5vw, 6rem)',
          lineHeight: 0.88, letterSpacing: '0.02em',
          whiteSpace: 'pre-line', marginBottom: 24,
          textShadow: `0 0 60px rgba(${rgb},0.25)`,
        }}>{s.headline}</h2>

        {/* Body */}
        <p style={{
          color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: 1.75,
          marginBottom: 36, maxWidth: 420,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>{s.body}</p>

        {/* CTA */}
        <Link
          to={s.to}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '13px 30px', borderRadius: 9999,
            border: `1px solid ${s.accent}`,
            color: '#fff', textDecoration: 'none',
            fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            background: `rgba(${rgb},0.12)`,
            boxShadow: `0 0 24px rgba(${rgb},0.12)`,
            transition: 'all 0.25s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = `rgba(${rgb},0.28)`;
            e.currentTarget.style.boxShadow = `0 0 36px rgba(${rgb},0.45)`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = `rgba(${rgb},0.12)`;
            e.currentTarget.style.boxShadow = `0 0 24px rgba(${rgb},0.12)`;
          }}
        >
          {s.cta} <ArrowRight size={13} />
        </Link>
      </div>

      {/* Thin horizontal rule between sections */}
      <div style={{
        position: 'absolute', bottom: 0, left: '8%', right: '8%',
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
      }} />
    </section>
  );
}

/* ─── Dashboard ──────────────────────────────────────────────────── */
export default function Dashboard() {
  const { pct, section } = useScroll();
  const [status, setStatus] = useState(null);
  const [titleVis, setTitleVis] = useState(false);

  useEffect(() => {
    fetch('/api/status').then(r => r.json()).then(setStatus).catch(() => {});
    // slight delay so fonts load
    const t = setTimeout(() => setTitleVis(true), 100);
    return () => clearTimeout(t);
  }, []);

  const modelReady = status?.model_loaded;

  return (
    /* push below fixed nav */
    <div style={{ marginTop: '-80px' }}>

      <ProgressHUD pct={pct} section={section} total={SECTIONS.length} />
      <SidebarHUD section={section} labels={SECTIONS.map(s => s.tag)} />

      {/* ══ Hero ══════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
      }}>
        {/* Status pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 16px', borderRadius: 9999, marginBottom: 44,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.09)',
          fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase',
          color: modelReady ? '#34d399' : 'rgba(255,255,255,0.35)',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: modelReady ? '#34d399' : 'rgba(255,255,255,0.25)',
            boxShadow: modelReady ? '0 0 8px #34d39990' : 'none',
            flexShrink: 0,
          }} />
          {status === null
            ? 'Connecting…'
            : modelReady
            ? 'AI Model Ready'
            : 'Bootstrapping model… please wait'}
        </div>

        {/* ── SIGN — main title ── */}
        <div style={{ position: 'relative', padding: '0 20px' }}>
          {/* Letter-by-letter reveal */}
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(7rem, 24vw, 20rem)',
            lineHeight: 0.85, letterSpacing: '0.04em',
            margin: 0,
            background: 'linear-gradient(175deg, #ffffff 0%, rgba(200,170,255,0.92) 50%, rgba(100,50,220,0.55) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 80px rgba(124,58,237,0.55))',
            opacity: titleVis ? 1 : 0,
            transform: titleVis ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 1.2s cubic-bezier(0.16,1,0.3,1), transform 1.2s cubic-bezier(0.16,1,0.3,1)',
          }}>
            SIGN
          </h1>
        </div>

        {/* Subtitle */}
        <p style={{
          marginTop: 14,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(0.7rem, 1.8vw, 0.92rem)',
          letterSpacing: '0.38em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.35)',
          opacity: titleVis ? 1 : 0,
          transform: titleVis ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 1.2s 0.3s ease, transform 1.2s 0.3s ease',
        }}>
          Language &nbsp;·&nbsp; Intelligence &nbsp;·&nbsp; Communication
        </p>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          color: 'rgba(255,255,255,0.2)',
          fontSize: '0.58rem', letterSpacing: '0.28em', textTransform: 'uppercase',
          animation: 'floatY 2.8s ease-in-out infinite',
          opacity: titleVis ? 1 : 0,
          transition: 'opacity 1s 0.8s ease',
        }}>
          SCROLL
          <div style={{ width: 1, height: 32, background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)' }} />
        </div>
      </section>

      {/* ══ Content sections ═════════════════════════════════════ */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {SECTIONS.map((s, i) => (
          <ContentSection key={s.num} s={s} index={i} />
        ))}
      </div>

      {/* ══ Footer ═══════════════════════════════════════════════ */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '28px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 10,
        fontSize: '0.68rem', letterSpacing: '0.1em',
        color: 'rgba(255,255,255,0.18)',
      }}>
        <span style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.95rem',
          letterSpacing: '0.18em', color: 'rgba(255,255,255,0.3)',
        }}>SIGNLANG AI</span>
        <span>MediaPipe · RandomForest · React · Vite</span>
        <span>Built by Arihant Khaitan</span>
      </footer>
    </div>
  );
}
