import { Link } from 'react-router-dom';
import { ArrowRight, Camera, BookOpen, Type, ShieldCheck } from 'lucide-react';
import { LANGUAGES } from '../lib/classifier';

const totalSigns = Object.values(LANGUAGES)
  .reduce((n, l) => n + l.model.labels.length, 0);

const FEATURES = [
  {
    icon: Camera,
    to: '/interpret',
    title: 'Live Interpreter',
    desc: 'Sign in front of your camera in ASL, BSL or ISL. Letters become words and sentences in real time, and a practice mode guides you letter by letter.',
    cta: 'Start signing',
  },
  {
    icon: BookOpen,
    to: '/learn',
    title: 'Learn',
    desc: 'Alphabet and number references for all three languages, animated ASL phrase signs, and a quiz to test yourself.',
    cta: 'Start learning',
  },
  {
    icon: Type,
    to: '/sign',
    title: 'Sign Player',
    desc: 'Type any text and watch it fingerspelled letter by letter, at your own pace, in the language you choose.',
    cta: 'Try it',
  },
];

function FeatureCard({ f }) {
  const Icon = f.icon;
  return (
    <Link to={f.to} className="card" style={{
      display: 'flex', flexDirection: 'column',
      padding: 24, textDecoration: 'none', color: 'inherit',
      transition: 'border-color 0.15s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hov)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 8,
        background: 'var(--accent-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
      }}>
        <Icon size={18} style={{ color: 'var(--accent)' }} />
      </div>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 6 }}>{f.title}</h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20, flex: 1 }}>
        {f.desc}
      </p>

      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: '0.85rem', fontWeight: 500, color: 'var(--accent)',
      }}>
        {f.cta} <ArrowRight size={14} />
      </span>
    </Link>
  );
}

export default function Dashboard() {
  return (
    <div>
      {/* Hero */}
      <section style={{
        padding: '64px 0 56px', maxWidth: 680, margin: '0 auto',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 9999, marginBottom: 28,
          background: 'var(--accent-soft)', border: '1px solid var(--border)',
          fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-2)',
        }}>
          <ShieldCheck size={13} style={{ color: 'var(--accent)' }} />
          ASL · BSL · ISL — fully on-device
        </div>

        <h1 className="chrome-text" style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          marginBottom: 18,
        }}>
          Sign language,<br />understood by your browser.
        </h1>

        <p style={{ fontSize: '1.02rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 32, maxWidth: 560 }}>
          SignLang recognises fingerspelling in American, British and Indian Sign Language
          through your webcam. Everything runs locally in your browser — no video or data
          ever leaves your device.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/interpret" className="btn btn-primary">
            Open Interpreter <ArrowRight size={15} />
          </Link>
          <Link to="/learn" className="btn btn-secondary">
            Learn the signs
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 0, marginTop: 48,
          border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden',
        }}>
          {[
            ['3', 'sign languages'],
            [String(totalSigns), 'signs recognised'],
            ['100%', 'private, on-device'],
          ].map(([num, label], i) => (
            <div key={label} style={{
              padding: '14px 26px', textAlign: 'center',
              borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
              background: 'var(--surface-grad)',
            }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{num}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 16,
      }}>
        {FEATURES.map(f => <FeatureCard key={f.to} f={f} />)}
      </section>

      {/* How it works */}
      <section style={{ marginTop: 64 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 20 }}>How it works</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}>
          {[
            ['1. Hand tracking', 'MediaPipe finds 21 landmarks per hand in every frame — one hand for ASL, both hands for BSL and ISL.'],
            ['2. Recognition', 'A neural network trained for each language reads the hand shapes and predicts the letter or number.'],
            ['3. Sentences', 'Hold a sign to add a letter, pause to end a word — then have the sentence spoken aloud.'],
          ].map(([title, desc]) => (
            <div key={title}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 6 }}>{title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: 24, lineHeight: 1.6 }}>
          Motion-based letters (like J and Z in ASL, or H, J and Y in BSL) can't be read from a
          single frame yet — the interpreter recognises their static pose where possible.
        </p>
      </section>
    </div>
  );
}
