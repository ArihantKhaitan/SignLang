import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import { LANGUAGES } from '../lib/classifier';
import { signImage } from '../lib/signRefs';

function tokenise(text) {
  const tokens = [];
  const words = text.toUpperCase().trim().split(/\s+/);
  words.forEach((word, wi) => {
    for (const ch of word) {
      if (/[A-Z0-9]/.test(ch)) tokens.push({ type: 'letter', value: ch });
    }
    if (wi < words.length - 1) tokens.push({ type: 'space', value: ' ' });
  });
  return tokens;
}

function SignImage({ lang, char }) {
  const [err, setErr] = useState(false);
  useEffect(() => setErr(false), [lang, char]);
  const src = signImage(lang, char);
  if (err) return (
    <div style={{
      width: 220, height: 220, background: 'var(--accent-soft)', borderRadius: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: '5rem', fontWeight: 700, color: 'var(--accent)' }}>{char}</span>
    </div>
  );
  return (
    <img src={src} alt={`${LANGUAGES[lang].name} ${char}`} width={220} height={220}
      style={{ width: 220, height: 220, objectFit: 'contain', background: '#fff', borderRadius: 12, border: '1px solid var(--border)', display: 'block' }}
      onError={() => setErr(true)} />
  );
}

const SPEED_OPTIONS = [
  { label: '0.5×', ms: 2000 },
  { label: '1×', ms: 1000 },
  { label: '1.5×', ms: 700 },
  { label: '2×', ms: 500 },
  { label: '3×', ms: 300 },
];

const SAMPLES = ['HELLO', 'THANK YOU', 'HOW ARE YOU', 'NICE TO MEET YOU', 'I LOVE ASL'];

export default function SignPlayer() {
  const [lang, setLang] = useState('asl');
  const [text, setText] = useState('');
  const [tokens, setTokens] = useState([]);
  const [idx, setIdx] = useState(-1);
  const [playing, setPlay] = useState(false);
  const [speedIdx, setSpd] = useState(1);
  const timerRef = useRef(null);
  const ms = SPEED_OPTIONS[speedIdx].ms;

  const advance = useCallback(() => {
    setIdx(prev => {
      const next = prev + 1;
      if (next >= tokens.length) { setPlay(false); return tokens.length - 1; }
      return next;
    });
  }, [tokens]);

  useEffect(() => {
    if (!playing) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(advance, ms);
    return () => clearInterval(timerRef.current);
  }, [playing, ms, advance]);

  const load = () => {
    if (!text.trim()) return;
    clearInterval(timerRef.current);
    setTokens(tokenise(text)); setIdx(-1); setPlay(false);
  };

  const play = () => {
    if (tokens.length === 0) { load(); return; }
    if (idx >= tokens.length - 1) setIdx(-1);
    setPlay(true);
  };

  const speak = () => {
    if (!text.trim() || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  };

  const currentToken = tokens[idx] ?? null;
  const progress = tokens.length > 0 ? ((idx + 1) / tokens.length) * 100 : 0;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Sign Player</h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-2)' }}>
            Type text and watch it fingerspelled in {LANGUAGES[lang].name}, letter by letter.
          </p>
        </div>
        <div style={{ display: 'inline-flex', gap: 2, padding: 3, background: '#101114', border: '1px solid var(--border)', borderRadius: 10 }}>
          {Object.values(LANGUAGES).map((l) => (
            <button key={l.key} onClick={() => setLang(l.key)} style={{
              minHeight: 38, padding: '0 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: lang === l.key ? 600 : 400,
              background: lang === l.key ? 'var(--surface-grad)' : 'transparent',
              color: lang === l.key ? 'var(--text)' : 'var(--text-2)',
              boxShadow: lang === l.key ? 'inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 3px rgba(0,0,0,0.4)' : 'none',
              transition: 'all 0.15s ease',
            }}>{l.name}</button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (load(), setTimeout(play, 50))}
            placeholder="Type anything — e.g. HELLO WORLD"
            aria-label="Text to fingerspell"
            style={{
              flex: 1, background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '0 14px', minHeight: 44,
              color: 'var(--text)', fontSize: '0.92rem', outline: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
          />
          <button onClick={() => { load(); setTimeout(play, 50); }} className="btn btn-primary">
            <Play size={14} /> Play
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SAMPLES.map(s => (
            <button key={s} onClick={() => setText(s)} style={{
              padding: '6px 12px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text-2)', cursor: 'pointer', fontSize: '0.78rem',
              transition: 'all 0.15s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-hov)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Player */}
      {tokens.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          {/* Progress */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>
              <span>{idx >= 0 ? `${idx + 1} / ${tokens.length}` : 'Ready'}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div style={{ width: '100%', height: 4, background: 'var(--border)', borderRadius: 9999, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--accent)', width: `${progress}%`, transition: 'width 0.3s' }} />
            </div>
          </div>

          {/* Current sign */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '8px 0 20px' }}>
            {currentToken?.type === 'letter' ? (
              <>
                <SignImage lang={lang} char={currentToken.value} />
                <span style={{ fontSize: '2.2rem', fontWeight: 700, lineHeight: 1 }}>{currentToken.value}</span>
              </>
            ) : currentToken?.type === 'space' ? (
              <div style={{ width: 220, height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div style={{ width: 48, height: 2, background: 'var(--border-hov)', borderRadius: 9999 }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>word break</span>
              </div>
            ) : (
              <div style={{
                width: 220, height: 220, background: 'var(--bg)', borderRadius: 12,
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>Press play</span>
              </div>
            )}
          </div>

          {/* Token strip */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', maxHeight: 64, overflowY: 'auto', marginBottom: 20 }}>
            {tokens.map((t, i) => (
              <button key={i} onClick={() => { clearInterval(timerRef.current); setPlay(false); setIdx(i); }} style={{
                minWidth: 26, padding: '4px 7px', borderRadius: 6, cursor: 'pointer',
                border: '1px solid', fontSize: '0.78rem', fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                borderColor: i === idx ? 'var(--accent)' : 'var(--border)',
                background: i === idx ? 'var(--accent-soft)' : 'var(--surface)',
                color: i === idx ? 'var(--accent)' : i < idx ? 'var(--text-3)' : 'var(--text-2)',
                transition: 'all 0.15s ease',
              }}>
                {t.type === 'space' ? '·' : t.value}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {SPEED_OPTIONS.map((s, i) => (
                <button key={i} onClick={() => setSpd(i)} style={{
                  minHeight: 36, padding: '0 10px', borderRadius: 8, cursor: 'pointer',
                  border: '1px solid',
                  borderColor: speedIdx === i ? 'var(--accent)' : 'var(--border)',
                  background: speedIdx === i ? 'var(--accent-soft)' : 'var(--surface)',
                  color: speedIdx === i ? 'var(--accent)' : 'var(--text-2)',
                  fontSize: '0.78rem', fontWeight: 500, transition: 'all 0.15s ease',
                }}>{s.label}</button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={speak} title="Speak aloud" aria-label="Speak aloud" className="btn btn-secondary" style={{ width: 44, padding: 0 }}>
                <Volume2 size={15} />
              </button>
              <button onClick={() => { clearInterval(timerRef.current); setPlay(false); setIdx(-1); }} title="Restart" aria-label="Restart" className="btn btn-secondary" style={{ width: 44, padding: 0 }}>
                <RotateCcw size={15} />
              </button>
              <button onClick={playing ? () => setPlay(false) : play} className="btn btn-primary">
                {playing ? <><Pause size={14} /> Pause</> : <><Play size={14} /> {idx >= 0 ? 'Resume' : 'Play'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
