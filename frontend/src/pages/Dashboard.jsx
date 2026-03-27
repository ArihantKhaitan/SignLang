import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, BookOpen, MessageSquare } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap, accent: '#7c3aed', rgb: '124,58,237',
    to: '/interpret', title: 'Live Interpreter',
    desc: 'Point your camera at your hands — AI reads your ASL signs and builds sentences in real time.',
    cta: 'Start Signing',
  },
  {
    icon: BookOpen, accent: '#06b6d4', rgb: '6,182,212',
    to: '/learn', title: 'Learn ASL',
    desc: 'Visual dictionary with animated signs for every letter, number and phrase. Quiz yourself as you go.',
    cta: 'Start Learning',
  },
  {
    icon: MessageSquare, accent: '#a78bfa', rgb: '167,139,250',
    to: '/sign', title: 'Sign Player',
    desc: 'Type any text and watch it fingerspelled in ASL — letter by letter, at your own pace.',
    cta: 'Try It',
  },
];

function FeatureCard({ f, i }) {
  const [hov, setHov] = useState(false);
  const Icon = f.icon;
  return (
    <Link to={f.to} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          animation: `fadeUp 0.6s ${0.45 + i * 0.1}s ease both`,
          padding: '28px 26px',
          borderRadius: 22,
          background: hov ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: `1px solid ${hov ? `rgba(${f.rgb},0.28)` : 'rgba(255,255,255,0.07)'}`,
          boxShadow: hov
            ? `inset 0 1px 0 rgba(255,255,255,0.14), 0 24px 64px rgba(0,0,0,0.55), 0 0 48px rgba(${f.rgb},0.08)`
            : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.35)',
          transform: hov ? 'translateY(-5px)' : 'translateY(0)',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
        }}
      >
        {/* Top shimmer on hover */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: hov
            ? `linear-gradient(90deg, transparent, rgba(${f.rgb},0.7), transparent)`
            : `linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)`,
          transition: 'background 0.3s',
        }} />

        {/* Icon */}
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          marginBottom: 22,
          background: `rgba(${f.rgb},0.1)`,
          border: `1px solid rgba(${f.rgb},0.18)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: hov ? `0 0 22px rgba(${f.rgb},0.18)` : 'none',
          transition: 'box-shadow 0.3s',
        }}>
          <Icon size={19} style={{ color: f.accent }} />
        </div>

        <h3 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.5rem', letterSpacing: '0.04em',
          margin: '0 0 10px', color: '#fff',
        }}>{f.title}</h3>

        <p style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '0.84rem', color: 'rgba(255,255,255,0.37)',
          lineHeight: 1.68, margin: '0 0 26px',
        }}>{f.desc}</p>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: '0.68rem', letterSpacing: '0.12em',
          textTransform: 'uppercase', fontWeight: 600,
          color: hov ? f.accent : 'rgba(255,255,255,0.22)',
          transition: 'color 0.25s',
        }}>
          {f.cta} <ArrowRight size={11} />
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [status, setStatus] = useState(null);
  useEffect(() => {
    fetch('/api/status').then(r => r.json()).then(setStatus).catch(() => {});
  }, []);
  const modelReady = status?.model_loaded;

  return (
    <div style={{ marginTop: '-80px' }}>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '0 24px',
        overflow: 'hidden',
      }}>

        {/* Ambient glow — single, soft */}
        <div style={{
          position: 'absolute', top: '5%', left: '50%',
          transform: 'translateX(-50%)',
          width: '80vw', maxWidth: 900, height: '70vh',
          background: 'radial-gradient(ellipse at 50% 25%, rgba(124,58,237,0.16) 0%, rgba(124,58,237,0.04) 50%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'nebulaPulse 8s ease-in-out infinite',
        }} />

        {/* Status pill */}
        <div style={{
          animation: 'fadeUp 0.65s ease both',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 18px', borderRadius: 9999, marginBottom: 56,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
          fontSize: '0.67rem', letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: modelReady ? '#34d399' : 'rgba(255,255,255,0.32)',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: modelReady ? '#34d399' : 'rgba(255,255,255,0.18)',
            boxShadow: modelReady ? '0 0 8px #34d399' : 'none',
          }} />
          {status === null ? 'Initialising…' : modelReady ? 'AI Model Ready' : 'Loading model…'}
        </div>

        {/* Main title */}
        <h1 style={{
          animation: 'fadeUp 0.65s 0.08s ease both',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(6rem, 22vw, 18rem)',
          lineHeight: 0.85, margin: 0,
          background: 'linear-gradient(170deg, #ffffff 15%, rgba(196,164,255,0.88) 58%, rgba(109,40,217,0.45) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.02em',
        }}>SIGN</h1>

        {/* Muted subtitle */}
        <p style={{
          animation: 'fadeUp 0.65s 0.16s ease both',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 'clamp(0.7rem, 1.8vw, 1rem)',
          letterSpacing: '0.6em',
          color: 'rgba(255,255,255,0.1)',
          margin: '18px 0 0',
        }}>LANGUAGE&nbsp;&nbsp;·&nbsp;&nbsp;INTELLIGENCE</p>

        {/* Tagline + CTA */}
        <div style={{ animation: 'fadeUp 0.65s 0.24s ease both', marginTop: 48 }}>
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(0.82rem, 1.4vw, 0.95rem)',
            color: 'rgba(255,255,255,0.3)',
            maxWidth: 380, lineHeight: 1.75,
            margin: '0 auto 36px',
          }}>
            Learn American Sign Language, communicate through signs,
            and let AI interpret them in real time.
          </p>

          <Link to="/learn"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '13px 32px', borderRadius: 9999,
              textDecoration: 'none',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.8), rgba(109,40,217,0.65))',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(124,58,237,0.4)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14), 0 0 32px rgba(124,58,237,0.22)',
              color: '#fff', fontSize: '0.78rem',
              fontWeight: 600, letterSpacing: '0.12em',
              textTransform: 'uppercase',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.2), 0 0 50px rgba(124,58,237,0.38)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.14), 0 0 32px rgba(124,58,237,0.22)';
            }}
          >
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── FEATURE CARDS ── */}
      <section style={{ padding: '40px 28px 120px', maxWidth: 1080, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: 14,
          alignItems: 'stretch',
        }}>
          {FEATURES.map((f, i) => <FeatureCard key={f.to} f={f} i={i} />)}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.04)',
        padding: '20px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 10,
        fontSize: '0.63rem', color: 'rgba(255,255,255,0.13)',
        letterSpacing: '0.07em',
      }}>
        <span style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: '0.85rem', letterSpacing: '0.16em',
          color: 'rgba(255,255,255,0.2)',
        }}>SIGNLANG AI</span>
        <span>Built by Arihant Khaitan · MediaPipe + RandomForest</span>
      </footer>
    </div>
  );
}
