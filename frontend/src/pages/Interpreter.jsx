import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Trash2, Delete, Info, VideoOff, Video } from 'lucide-react';

const glass = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: '16px',
};

/* Circular hold-progress arc */
const HoldRing = ({ progress }) => {
  const r = 46, circ = 2 * Math.PI * r;
  const filled = circ * Math.min(progress, 1);
  const color = progress >= 1 ? '#34d399' : '#7c3aed';
  return (
    <svg width="108" height="108"
      style={{ position: 'absolute', inset: 0, margin: 'auto', transform: 'rotate(-90deg)' }}>
      <circle cx="54" cy="54" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
      {progress > 0 && (
        <circle cx="54" cy="54" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.12s linear', filter: `drop-shadow(0 0 8px ${color})` }} />
      )}
    </svg>
  );
};

const api = (path, opts) => fetch(`/api${path}`, opts);

export default function Interpreter() {
  const [state, setState] = useState({
    prediction: '', confidence: 0, hand_detected: false,
    sentence_state: { current_letter: null, hold_progress: 0, current_word: '', words: [], full_text: '' },
  });
  const [cameraOn, setCameraOn] = useState(true);
  const [voiceOn, setVoiceOn]   = useState(true);
  const [flash, setFlash]       = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const prevText = useRef('');

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const d = await api('/predict').then(r => r.json());
        setState(d);
        if (d.sentence_state.full_text !== prevText.current) {
          prevText.current = d.sentence_state.full_text;
          setFlash(true); setTimeout(() => setFlash(false), 200);
        }
      } catch {}
    }, 150);
    return () => clearInterval(id);
  }, []);

  const clear     = () => api('/sentence/clear',    { method: 'POST' });
  const backspace = () => api('/sentence/backspace', { method: 'POST' });
  const space     = () => api('/sentence/space',     { method: 'POST' });
  const speak     = async () => {
    const text = state.sentence_state.full_text;
    if (!text) return;
    setSpeaking(true);
    await api('/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
    setTimeout(() => setSpeaking(false), 1500);
  };

  const { prediction, confidence, hand_detected, sentence_state: ss } = state;
  const pct = Math.round(confidence * 100);

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 22, height: 1, background: '#7c3aed' }} />
          <span style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#7c3aed' }}>Live Recognition</span>
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.4rem,5vw,3.5rem)', lineHeight: 1, margin: 0 }}>
          INTERPRETER
        </h1>
      </div>

      {/* ── Two-column grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}
        className="interp-grid">

        {/* ── LEFT: Camera ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Camera panel */}
          <div style={{ position: 'relative', ...glass, overflow: 'hidden', padding: 0, aspectRatio: '16/9', minHeight: 320 }}>
            {cameraOn ? (
              <img
                src="/api/video_feed"
                alt="Live camera feed"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 12,
                background: 'rgba(0,0,0,0.6)',
              }}>
                <VideoOff size={40} style={{ color: 'rgba(255,255,255,0.2)' }} />
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>Camera off</span>
              </div>
            )}

            {/* Camera toggle button — top-right corner */}
            <button
              onClick={() => setCameraOn(v => !v)}
              style={{
                position: 'absolute', top: 14, right: 14,
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                background: cameraOn ? 'rgba(0,0,0,0.55)' : 'rgba(239,68,68,0.25)',
                backdropFilter: 'blur(12px)',
                color: cameraOn ? 'rgba(255,255,255,0.8)' : '#f87171',
                fontSize: '0.72rem', letterSpacing: '0.06em',
                border: `1px solid ${cameraOn ? 'rgba(255,255,255,0.12)' : 'rgba(239,68,68,0.4)'}`,
                transition: 'all 0.2s',
              }}
            >
              {cameraOn ? <><Video size={13} /> Camera On</> : <><VideoOff size={13} /> Camera Off</>}
            </button>

            {/* Hand detected indicator — bottom-left */}
            <div style={{
              position: 'absolute', bottom: 14, left: 14,
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '5px 12px', borderRadius: 9999,
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.07)',
              fontSize: '0.68rem', color: hand_detected ? '#34d399' : 'rgba(255,255,255,0.3)',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: hand_detected ? '#34d399' : 'rgba(255,255,255,0.2)',
                boxShadow: hand_detected ? '0 0 8px #34d39980' : 'none',
                animation: hand_detected ? 'nebulaPulse 1.5s ease-in-out infinite' : 'none',
              }} />
              {hand_detected ? 'Hand detected' : 'No hand in frame'}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Detection + Sentence ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Detected sign card */}
          <div style={{ ...glass, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                Detected Sign
              </span>
              <button onClick={() => setVoiceOn(v => !v)} style={{
                width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: voiceOn ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                color: voiceOn ? '#a78bfa' : 'rgba(255,255,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {voiceOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
              </button>
            </div>

            <div style={{
              position: 'relative', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              minHeight: 150, background: 'rgba(0,0,0,0.35)', borderRadius: 12, padding: 16,
            }}>
              <HoldRing progress={ss.hold_progress} />
              {prediction ? (
                <div style={{ zIndex: 1, textAlign: 'center' }}>
                  <span style={{
                    fontFamily: "'Bebas Neue', sans-serif", fontSize: '5.5rem', lineHeight: 1, display: 'block',
                    filter: 'drop-shadow(0 0 24px rgba(124,58,237,0.7))',
                  }}>{prediction}</span>
                  <div style={{ width: 90, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 9999, margin: '8px auto 4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      background: pct > 85 ? '#34d399' : pct > 65 ? '#fbbf24' : '#f87171',
                      width: `${pct}%`, transition: 'width 0.2s', borderRadius: 9999,
                    }} />
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>{pct}%</span>
                  {ss.hold_progress > 0 && (
                    <span style={{ display: 'block', fontSize: '0.68rem', marginTop: 4, color: ss.hold_progress >= 1 ? '#34d399' : '#a78bfa' }}>
                      {ss.hold_progress >= 1 ? '✓ Registered!' : `Holding ${Math.round(ss.hold_progress * 100)}%`}
                    </span>
                  )}
                </div>
              ) : (
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)', zIndex: 1 }}>Sign something…</span>
              )}
            </div>
          </div>

          {/* Sentence builder */}
          <div style={{ ...glass, padding: 18 }}>
            <span style={{ fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 10 }}>
              Sentence Builder
            </span>

            {ss.current_word && (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)' }}>Spelling:</span>
                {ss.current_word.split('').map((ch, i) => (
                  <span key={i} style={{ padding: '1px 5px', borderRadius: 4, background: 'rgba(124,58,237,0.2)', color: '#c4b5fd', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.8rem' }}>{ch}</span>
                ))}
              </div>
            )}

            {/* Text area */}
            <div style={{
              minHeight: 68, background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 12, marginBottom: 12,
              border: flash ? '1px solid rgba(124,58,237,0.45)' : '1px solid rgba(255,255,255,0.04)',
              transition: 'border-color 0.15s',
            }}>
              {ss.words.length > 0 || ss.current_word ? (
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>
                  {ss.words.map((w, i) => <span key={i}>{w} </span>)}
                  {ss.current_word && <span style={{ color: '#c4b5fd', textDecoration: 'underline', textDecorationStyle: 'dashed' }}>{ss.current_word}</span>}
                </p>
              ) : (
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.2)' }}>Your sentence will appear here…</span>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7 }}>
              {[
                { label: 'Del',   icon: <Delete size={12} />,   fn: backspace, accent: null },
                { label: 'Space', icon: null,                   fn: space,     accent: null },
                { label: speaking ? 'Speaking…' : 'Speak', icon: <Volume2 size={12} />, fn: speak, accent: speaking ? '#34d399' : '#7c3aed' },
                { label: '',      icon: <Trash2 size={12} />,   fn: clear,     accent: null },
              ].map(({ label, icon, fn, accent }, i) => (
                <button key={i} onClick={fn} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  padding: '9px 4px', borderRadius: 9, cursor: 'pointer', fontSize: '0.7rem',
                  background: accent ? `rgba(${accent === '#7c3aed' ? '124,58,237' : '52,211,153'},0.18)` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${accent ? (accent === '#7c3aed' ? 'rgba(124,58,237,0.4)' : 'rgba(52,211,153,0.4)') : 'rgba(255,255,255,0.07)'}`,
                  color: accent ? (accent === '#7c3aed' ? '#a78bfa' : '#34d399') : 'rgba(255,255,255,0.55)',
                  transition: 'all 0.15s',
                }}>{icon}{label}</button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div style={{ ...glass, padding: 13, fontSize: '0.7rem', color: 'rgba(255,255,255,0.32)', lineHeight: 1.7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5, fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>
              <Info size={10} /> Tips
            </div>
            Hold sign <span style={{ color: 'rgba(255,255,255,0.6)' }}>1.5s</span> to register · Pause <span style={{ color: 'rgba(255,255,255,0.6)' }}>2s</span> for word break · Train SPACE/DEL for hands-free use
          </div>
        </div>
      </div>
    </div>
  );
}
