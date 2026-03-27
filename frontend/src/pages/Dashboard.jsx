import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, BookOpen, MessageSquare } from 'lucide-react';

/* ── Glare card: cursor-tracked light shimmer ─────────────────────── */
function GlareCard({ children, accent = '#7c3aed' }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const onMove = e => {
    const r = ref.current.getBoundingClientRect();
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', overflow: 'hidden',
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? `${accent}50` : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 20, padding: '28px 26px',
        transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.3s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${accent}20` : '0 4px 20px rgba(0,0,0,0.3)',
        cursor: 'pointer', backdropFilter: 'blur(12px)',
      }}>
      {/* Glare layer */}
      {hovered && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 20,
          background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(255,255,255,0.07) 0%, transparent 60%)`,
        }} />
      )}
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
        background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`,
        opacity: hovered ? 1 : 0.4, transition: 'opacity 0.3s',
      }} />
      {children}
    </div>
  );
}

const FEATURES = [
  {
    icon: Zap, accent: '#7c3aed', to: '/interpret',
    title: 'Live Interpreter',
    desc: 'Point your camera and the AI instantly reads your ASL signs — building sentences hands-free in real time.',
    cta: 'Start Signing',
  },
  {
    icon: BookOpen, accent: '#06b6d4', to: '/learn',
    title: 'Learn ASL',
    desc: 'Visual dictionary with animated GIFs for every letter, number, and phrase. Quiz yourself as you go.',
    cta: 'Start Learning',
  },
  {
    icon: MessageSquare, accent: '#8b5cf6', to: '/sign',
    title: 'Sign Player',
    desc: 'Type any text and watch it fingerspelled in ASL — letter by letter — at your own pace.',
    cta: 'Try It',
  },
];

function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVis(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(30px)',
      transition: 'opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)',
      ...style,
    }}>{children}</div>
  );
}

export default function Dashboard() {
  const [status, setStatus] = useState(null);
  useEffect(() => { fetch('/api/status').then(r => r.json()).then(setStatus).catch(() => {}); }, []);
  const modelReady = status?.model_loaded;

  return (
    <div style={{ marginTop: '-80px' }}>

      {/* ══════════════════════════════════════════
          HERO — Lamp spotlight + massive title
      ══════════════════════════════════════════ */}
      <section style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', textAlign: 'center', padding: '0 24px',
      }}>

        {/* ── Lamp conic spotlight effect ── */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {/* Left wing */}
          <div style={{
            position: 'absolute', top: 0, right: '50%',
            width: '45vw', height: '55vh',
            background: 'conic-gradient(from 70deg at 100% 0%, transparent 0deg, rgba(6,182,212,0.22) 40deg, rgba(124,58,237,0.15) 80deg, transparent 120deg)',
            transformOrigin: 'right top',
          }} />
          {/* Right wing */}
          <div style={{
            position: 'absolute', top: 0, left: '50%',
            width: '45vw', height: '55vh',
            background: 'conic-gradient(from 290deg at 0% 0%, transparent 0deg, rgba(124,58,237,0.22) 40deg, rgba(6,182,212,0.15) 80deg, transparent 120deg)',
            transformOrigin: 'left top',
          }} />
          {/* Centre glow orb */}
          <div style={{
            position: 'absolute', top: '-2%', left: '50%', transform: 'translateX(-50%)',
            width: '40vw', height: '35vh',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.5) 0%, rgba(124,58,237,0.15) 40%, transparent 70%)',
            filter: 'blur(4px)',
            animation: 'nebulaPulse 5s ease-in-out infinite',
          }} />
          {/* Horizontal glow line */}
          <div style={{
            position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
            width: '50vw', maxWidth: 600, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.8), rgba(124,58,237,0.8), transparent)',
            boxShadow: '0 0 20px rgba(124,58,237,0.6)',
            animation: 'beamPulse 4s ease-in-out infinite',
          }} />
        </div>

        {/* ── Status badge ── */}
        <FadeIn delay={200}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '5px 18px', borderRadius: 9999, marginBottom: 44,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase',
            color: modelReady ? '#34d399' : '#94a3b8',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
              background: modelReady ? '#34d399' : '#475569',
              boxShadow: modelReady ? '0 0 10px #34d399' : 'none',
              animation: modelReady ? 'nebulaPulse 2s ease-in-out infinite' : 'none',
            }} />
            {status === null ? 'Loading…' : modelReady ? 'AI Model Ready — 26 ASL Signs' : 'Preparing AI model…'}
          </div>
        </FadeIn>

        {/* ── Main title ── */}
        <FadeIn delay={350}>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(5.5rem, 20vw, 16rem)',
            lineHeight: 0.85, letterSpacing: '0.03em', margin: 0,
            background: 'linear-gradient(175deg, #ffffff 0%, rgba(196,164,255,0.9) 55%, rgba(109,40,217,0.6) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 80px rgba(124,58,237,0.6))',
          }}>SIGN</h1>

          <p style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(1.2rem, 4vw, 2.8rem)',
            letterSpacing: '0.35em', color: 'rgba(255,255,255,0.25)',
            margin: '12px 0 0',
          }}>LANGUAGE &nbsp;·&nbsp; INTELLIGENCE</p>
        </FadeIn>

        {/* ── Tagline ── */}
        <FadeIn delay={550} style={{ marginTop: 28 }}>
          <p style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
            color: 'rgba(255,255,255,0.4)', maxWidth: 480,
            lineHeight: 1.7, margin: '0 auto 40px',
          }}>
            Learn American Sign Language, communicate through signs, and let AI interpret them in real time.
          </p>
          <Link to="/learn" style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 36px', borderRadius: 9999, textDecoration: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
            color: '#fff', fontSize: '0.85rem', fontWeight: 600,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            boxShadow: '0 0 40px rgba(124,58,237,0.5), 0 4px 20px rgba(0,0,0,0.4)',
            transition: 'all 0.25s',
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 60px rgba(124,58,237,0.7), 0 4px 20px rgba(0,0,0,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(124,58,237,0.5), 0 4px 20px rgba(0,0,0,0.4)'; e.currentTarget.style.transform = 'none'; }}
          >
            Get Started <ArrowRight size={15} />
          </Link>
        </FadeIn>

        {/* Scroll cue */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          color: 'rgba(255,255,255,0.15)', fontSize: '0.58rem',
          letterSpacing: '0.3em', textTransform: 'uppercase',
          animation: 'floatY 3s ease-in-out infinite',
        }}>
          SCROLL
          <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES — 3 glare cards
      ══════════════════════════════════════════ */}
      <section style={{ padding: '100px 40px 120px', maxWidth: 1200, margin: '0 auto' }}>

        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16,
              fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
            }}>
              <div style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.2)' }} />
              Everything you need
              <div style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.2)' }} />
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              letterSpacing: '0.04em', margin: 0,
            }}>
              THREE WAYS TO COMMUNICATE
            </h2>
          </div>
        </FadeIn>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <FadeIn key={f.to} delay={i * 120}>
                <Link to={f.to} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <GlareCard accent={f.accent}>
                    {/* Icon */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 14, marginBottom: 20,
                      background: `rgba(${f.accent === '#7c3aed' ? '124,58,237' : f.accent === '#06b6d4' ? '6,182,212' : '139,92,246'},0.15)`,
                      border: `1px solid ${f.accent}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 0 20px ${f.accent}20`,
                    }}>
                      <Icon size={22} style={{ color: f.accent }} />
                    </div>

                    <h3 style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: '1.6rem', letterSpacing: '0.04em', margin: '0 0 10px',
                    }}>{f.title}</h3>

                    <p style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)',
                      lineHeight: 1.7, margin: '0 0 24px',
                    }}>{f.desc}</p>

                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: f.accent, fontWeight: 600,
                    }}>
                      {f.cta} <ArrowRight size={12} />
                    </div>
                  </GlareCard>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 10, fontSize: '0.68rem',
        color: 'rgba(255,255,255,0.18)', letterSpacing: '0.08em',
      }}>
        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.9rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>
          SIGNLANG AI
        </span>
        <span>Built by Arihant Khaitan · Powered by MediaPipe + RandomForest</span>
      </footer>
    </div>
  );
}
