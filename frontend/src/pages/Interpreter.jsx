import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Trash2, Delete, VideoOff, Video, Loader2, AlertTriangle, Space, Play, X, SkipForward, CheckCircle2 } from 'lucide-react';
import { createHandLandmarker } from '../lib/handLandmarker';
import { classifyHands, PredictionSmoother, LANGUAGES, supportedSymbols } from '../lib/classifier';
import { SentenceBuilder } from '../lib/sentenceBuilder';
import { drawHand } from '../lib/drawHand';
import { signImage } from '../lib/signRefs';
import { speak } from '../lib/tts';

const PRACTICE_HOLD_MS = 800;
const PRACTICE_MIN_CONF = 0.65;

/* Circular hold-progress arc */
const HoldRing = ({ progress }) => {
  const r = 46, circ = 2 * Math.PI * r;
  const filled = circ * Math.min(progress, 1);
  const color = progress >= 1 ? 'var(--success)' : 'var(--accent)';
  return (
    <svg width="108" height="108"
      style={{ position: 'absolute', inset: 0, margin: 'auto', transform: 'rotate(-90deg)' }}>
      <circle cx="54" cy="54" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
      {progress > 0 && (
        <circle cx="54" cy="54" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.12s linear' }} />
      )}
    </svg>
  );
};

/* Reference image with letter fallback */
function RefImage({ lang, symbol, size = 120 }) {
  const [err, setErr] = useState(false);
  useEffect(() => setErr(false), [lang, symbol]);
  if (err) return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-soft)', borderRadius: 8 }}>
      <span style={{ fontSize: size * 0.4, fontWeight: 700, color: 'var(--accent)' }}>{symbol}</span>
    </div>
  );
  return <img src={signImage(lang, symbol)} alt={`${LANGUAGES[lang].name} sign ${symbol}`}
    width={size} height={size}
    style={{ width: size, height: size, objectFit: 'contain', borderRadius: 8, background: '#fff' }}
    onError={() => setErr(true)} />;
}

export default function Interpreter() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const builderRef = useRef(new SentenceBuilder());
  const smootherRef = useRef(new PredictionSmoother());
  const voiceOnRef = useRef(true);

  const [lang, setLang] = useState('asl');
  const [cameraOn, setCameraOn] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);
  const [engine, setEngine] = useState({ phase: 'loading', error: null }); // loading | camera | running | error
  const [view, setView] = useState({
    prediction: '', confidence: 0, handsDetected: 0, fps: 0,
    practiceProgress: 0,
    sentence: builderRef.current.state(),
  });
  const [speaking, setSpeaking] = useState(false);

  // ── Practice ("follow along") mode ──
  const [practiceInput, setPracticeInput] = useState('');
  const [practice, setPractice] = useState(null); // { tokens:[{ch,type}], idx, done }
  const practiceRef = useRef({ active: false, target: null, holdStart: 0 });
  const advanceRef = useRef(() => {});

  voiceOnRef.current = voiceOn;

  const nextSupportedIdx = useCallback((tokens, from) => {
    for (let i = from; i < tokens.length; i++) {
      if (tokens[i].type === 'letter') return i;
    }
    return -1;
  }, []);

  const startPractice = () => {
    const text = practiceInput.trim().toUpperCase();
    if (!text) return;
    const symbols = supportedSymbols(lang);
    const tokens = [...text].map((ch) => ({
      ch,
      type: ch === ' ' ? 'space' : symbols.has(ch) ? 'letter' : 'skip',
    }));
    const idx = nextSupportedIdx(tokens, 0);
    if (idx === -1) return;
    setPractice({ tokens, idx, done: false });
  };

  const advancePractice = useCallback(() => {
    setPractice((p) => {
      if (!p || p.done) return p;
      const idx = nextSupportedIdx(p.tokens, p.idx + 1);
      if (idx === -1) return { ...p, idx: p.idx, done: true };
      return { ...p, idx };
    });
  }, [nextSupportedIdx]);
  advanceRef.current = advancePractice;

  // keep the rAF loop's view of practice in sync without restarting the camera
  useEffect(() => {
    practiceRef.current = {
      active: !!practice && !practice.done,
      target: practice && !practice.done ? practice.tokens[practice.idx].ch : null,
      holdStart: 0,
    };
  }, [practice]);

  // reset practice + smoother when language changes
  useEffect(() => {
    setPractice(null);
    smootherRef.current.clear();
    builderRef.current.clear();
  }, [lang]);

  useEffect(() => {
    if (!cameraOn) return;
    let cancelled = false;
    let raf = 0;
    let landmarker = null;
    let stream = null;

    async function start() {
      try {
        setEngine({ phase: 'loading', error: null });
        landmarker = await createHandLandmarker(LANGUAGES[lang].numHands);
        if (cancelled) return;

        setEngine({ phase: 'camera', error: null });
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        });
        if (cancelled) return;

        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();
        if (cancelled) return;
        setEngine({ phase: 'running', error: null });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let lastVideoTime = -1;
        let frames = 0;
        let fpsWindowStart = performance.now();
        let fps = 0;
        let lastUiPush = 0;

        const loop = () => {
          if (cancelled) return;
          raf = requestAnimationFrame(loop);
          if (video.readyState < 2 || video.currentTime === lastVideoTime) return;
          lastVideoTime = video.currentTime;

          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
          }

          const result = landmarker.detectForVideo(video, performance.now());
          const hands = result.landmarks || [];

          let raw = { label: null, confidence: 0 };
          if (hands.length > 0) raw = classifyHands(lang, hands);
          const smooth = smootherRef.current.push(hands.length ? raw.label : null, raw.confidence);

          const now = performance.now();
          const builder = builderRef.current;
          const ps = practiceRef.current;
          let practiceProgress = 0;

          if (ps.active) {
            // follow-along: hold the target sign to advance
            if (smooth.label === ps.target && smooth.confidence >= PRACTICE_MIN_CONF) {
              if (!ps.holdStart) ps.holdStart = now;
              practiceProgress = Math.min((now - ps.holdStart) / PRACTICE_HOLD_MS, 1);
              if (practiceProgress >= 1) {
                ps.holdStart = 0;
                ps.active = false;          // pause until state effect re-syncs
                advanceRef.current();
              }
            } else {
              ps.holdStart = 0;
            }
          } else if (!practiceRef.current.target) {
            // free signing: build sentences
            const before = builder.words.length;
            builder.update(smooth.label, smooth.confidence);
            if (voiceOnRef.current && builder.words.length > before) {
              speak(builder.words[builder.words.length - 1]);
            }
          }

          // draw skeletons (mirrored to match the selfie view)
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (hands.length) {
            ctx.save();
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            const locked = ps.target ? practiceProgress >= 1 : builder.holdProgress >= 1;
            for (const lm of hands) drawHand(ctx, lm, canvas.width, canvas.height, locked);
            ctx.restore();
          }

          frames++;
          if (now - fpsWindowStart >= 1000) {
            fps = Math.round((frames * 1000) / (now - fpsWindowStart));
            frames = 0;
            fpsWindowStart = now;
          }

          if (now - lastUiPush > 66) { // ~15 Hz UI updates
            lastUiPush = now;
            setView({
              prediction: smooth.label || '',
              confidence: smooth.confidence,
              handsDetected: hands.length,
              fps,
              practiceProgress,
              sentence: builder.state(),
            });
          }
        };
        loop();
      } catch (err) {
        console.error(err);
        if (!cancelled) setEngine({ phase: 'error', error: err?.message || String(err) });
      }
    }

    start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      landmarker?.close();
      smootherRef.current.clear();
    };
  }, [cameraOn, lang]);

  const pushSentence = () => setView((v) => ({ ...v, sentence: builderRef.current.state() }));
  const clear = () => { builderRef.current.clear(); pushSentence(); };
  const backspace = () => { builderRef.current.backspace(); pushSentence(); };
  const space = () => { builderRef.current.endWord(); pushSentence(); };
  const speakSentence = () => {
    const text = builderRef.current.fullText;
    if (!text) return;
    setSpeaking(true);
    speak(text);
    setTimeout(() => setSpeaking(false), 1500);
  };

  const { prediction, confidence, handsDetected, fps, practiceProgress, sentence: ss } = view;
  const pct = Math.round(confidence * 100);
  const langInfo = LANGUAGES[lang];
  const practicing = !!practice && !practice.done;

  return (
    <div>
      {/* Page header + language switch */}
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Interpreter
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-2)' }}>
            {langInfo.full} · hold a sign to add a letter, pause to end a word.
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

      <div className="interp-grid">

        {/* ── LEFT: Camera + practice ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
        <div className="card" style={{ position: 'relative', overflow: 'hidden', aspectRatio: '16/9', minHeight: 320, background: '#000' }}>
          {cameraOn ? (
            <>
              <video
                ref={videoRef}
                muted playsInline
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover', transform: 'scaleX(-1)',
                }}
              />
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover', pointerEvents: 'none',
                }}
              />
              {engine.phase !== 'running' && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 12, background: '#0e0f11',
                }}>
                  {engine.phase === 'error' ? (
                    <>
                      <AlertTriangle size={30} style={{ color: 'var(--danger)' }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--danger)', maxWidth: 380, textAlign: 'center', padding: '0 20px' }}>
                        {engine.error?.includes('Permission') || engine.error?.includes('NotAllowed')
                          ? 'Camera permission denied — allow camera access and reload.'
                          : `Couldn't start: ${engine.error}`}
                      </span>
                    </>
                  ) : (
                    <>
                      <Loader2 size={26} style={{ color: 'var(--text-2)', animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
                        {engine.phase === 'loading' ? 'Loading hand tracking…' : 'Starting camera…'}
                      </span>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              <VideoOff size={32} style={{ color: 'var(--text-3)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>Camera off</span>
            </div>
          )}

          {/* Camera toggle */}
          <button
            onClick={() => setCameraOn(v => !v)}
            style={{
              position: 'absolute', top: 12, right: 12,
              display: 'flex', alignItems: 'center', gap: 6,
              minHeight: 36, padding: '0 14px', borderRadius: 8, cursor: 'pointer',
              background: 'rgba(14,15,17,0.8)',
              backdropFilter: 'blur(6px)',
              color: cameraOn ? 'var(--text)' : 'var(--danger)',
              fontSize: '0.8rem', fontWeight: 500,
              border: '1px solid var(--border)',
            }}
          >
            {cameraOn ? <><Video size={13} /> On</> : <><VideoOff size={13} /> Off</>}
          </button>

          {/* Status row */}
          <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 8 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '5px 12px', borderRadius: 8,
              background: 'rgba(14,15,17,0.8)',
              backdropFilter: 'blur(6px)',
              border: '1px solid var(--border)',
              fontSize: '0.75rem', fontWeight: 500,
              color: handsDetected ? 'var(--success)' : 'var(--text-2)',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: handsDetected ? 'var(--success)' : '#4a4f57',
              }} />
              {handsDetected === 0 ? 'No hand in frame'
                : handsDetected === 1 ? 'Hand detected' : '2 hands detected'}
            </div>
            {engine.phase === 'running' && fps > 0 && (
              <div style={{
                padding: '5px 12px', borderRadius: 8,
                background: 'rgba(14,15,17,0.8)',
                backdropFilter: 'blur(6px)',
                border: '1px solid var(--border)',
                fontSize: '0.75rem', color: 'var(--text-2)',
                fontVariantNumeric: 'tabular-nums',
              }}>{fps} fps</div>
            )}
          </div>
        </div>

      {/* ── Practice / follow-along ── */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: practice ? 18 : 12 }}>
          <div>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, display: 'block' }}>Practice</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>
              Type a word, copy the sign shown, and it advances when you get each letter right.
            </span>
          </div>
          {practice && (
            <button onClick={() => setPractice(null)} className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>
              <X size={14} /> Stop
            </button>
          )}
        </div>

        {!practice ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              value={practiceInput}
              onChange={(e) => setPracticeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startPractice()}
              placeholder={`Type a word to practise in ${langInfo.name} — e.g. HELLO`}
              aria-label="Word to practise"
              style={{
                flex: 1, minWidth: 220, background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '0 14px', minHeight: 44,
                color: 'var(--text)', fontSize: '0.92rem', outline: 'none',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
            />
            <button onClick={startPractice} className="btn btn-primary">
              <Play size={14} /> Start
            </button>
          </div>
        ) : practice.done ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 0' }}>
            <CheckCircle2 size={40} style={{ color: 'var(--success)' }} />
            <span style={{ fontSize: '1.05rem', fontWeight: 600 }}>Nice — you signed it all!</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { const t = practice.tokens; setPractice({ tokens: t, idx: nextSupportedIdx(t, 0), done: false }); }}
                className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>Again</button>
              <button onClick={() => setPractice(null)} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>New word</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Target sign */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <RefImage lang={lang} symbol={practice.tokens[practice.idx].ch} size={130} />
              <div style={{ width: 130, height: 4, background: 'var(--border)', borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${Math.round(practiceProgress * 100)}%`,
                  background: practiceProgress >= 1 ? 'var(--success)' : 'var(--accent)',
                  transition: 'width 0.1s linear',
                }} />
              </div>
            </div>

            {/* Letters */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {practice.tokens.map((t, i) => {
                  const doneTok = i < practice.idx && t.type === 'letter';
                  const current = i === practice.idx;
                  if (t.type === 'space') return <span key={i} style={{ width: 14 }} />;
                  return (
                    <span key={i} style={{
                      minWidth: 34, height: 40, padding: '0 8px',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 8, fontSize: '1.05rem', fontWeight: 600,
                      border: '1px solid',
                      borderColor: current ? 'var(--accent)' : doneTok ? 'var(--success)' : 'var(--border)',
                      background: current ? 'var(--accent-soft)' : doneTok ? 'var(--success-soft)' : 'transparent',
                      color: t.type === 'skip' ? 'var(--text-3)' : doneTok ? 'var(--success)' : current ? 'var(--text)' : 'var(--text-2)',
                      textDecoration: t.type === 'skip' ? 'line-through' : 'none',
                    }}>{t.ch}</span>
                  );
                })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-2)' }}>
                  Sign <strong style={{ color: 'var(--text)' }}>{practice.tokens[practice.idx].ch}</strong> and hold
                  {view.prediction === practice.tokens[practice.idx].ch ? ' — keep holding…' : ''}
                </span>
                <button onClick={advancePractice} className="btn btn-ghost" style={{ fontSize: '0.8rem', minHeight: 36 }}>
                  <SkipForward size={13} /> Skip letter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
        </div>

        {/* ── RIGHT: Detection + Sentence ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Detected sign */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)' }}>
                Detected sign · {langInfo.name}
              </span>
              <button onClick={() => setVoiceOn(v => !v)} title="Speak each word automatically"
                aria-label="Toggle auto-speak" style={{
                  width: 36, height: 36, borderRadius: 8, cursor: 'pointer',
                  border: '1px solid var(--border)',
                  background: voiceOn ? 'var(--accent-soft)' : 'var(--surface)',
                  color: voiceOn ? 'var(--accent)' : 'var(--text-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                {voiceOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
            </div>

            <div style={{
              position: 'relative', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              minHeight: 148,
            }}>
              <HoldRing progress={practicing ? practiceProgress : ss.holdProgress} />
              {prediction ? (
                <div style={{ zIndex: 1, textAlign: 'center' }}>
                  <span style={{
                    fontSize: '3.4rem', fontWeight: 700, lineHeight: 1, display: 'block',
                    color: (practicing ? practiceProgress >= 1 : ss.holdProgress >= 1) ? 'var(--success)' : 'var(--text)',
                  }}>{prediction}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>
                    {pct}%
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-3)', zIndex: 1 }}>
                  {handsDetected ? 'Reading…' : langInfo.numHands === 2 ? 'Show your hands' : 'Show a sign'}
                </span>
              )}
            </div>
          </div>

          {/* Sentence (hidden during practice) */}
          {!practicing && (
            <div className="card" style={{ padding: 20 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 12 }}>
                Sentence
              </span>

              <div style={{
                minHeight: 72, background: 'var(--bg)', borderRadius: 8, padding: 12, marginBottom: 12,
                border: '1px solid var(--border)',
                fontSize: '1rem', lineHeight: 1.6,
              }}>
                {ss.words.length > 0 || ss.currentWord ? (
                  <p style={{ margin: 0 }}>
                    {ss.words.join(' ')}{ss.words.length > 0 && ss.currentWord ? ' ' : ''}
                    {ss.currentWord && (
                      <span style={{ color: 'var(--accent)', borderBottom: '2px dotted var(--accent)' }}>
                        {ss.currentWord}
                      </span>
                    )}
                  </p>
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>
                    Letters you sign will appear here.
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {[
                  { label: 'Delete', icon: <Delete size={14} />, fn: backspace },
                  { label: 'Space', icon: <Space size={14} />, fn: space },
                  { label: speaking ? '…' : 'Speak', icon: <Volume2 size={14} />, fn: speakSentence, primary: true },
                  { label: 'Clear', icon: <Trash2 size={14} />, fn: clear },
                ].map(({ label, icon, fn, primary }) => (
                  <button key={label} onClick={fn} title={label} className={primary ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{ padding: 0, fontSize: '0.78rem', gap: 5 }}>
                    {icon}{label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {!practicing && (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', lineHeight: 1.7, padding: '0 4px' }}>
              {lang === 'asl' && 'One-handed alphabet. J and Z involve motion — hold their final pose.'}
              {lang === 'bsl' && 'Mostly two-handed — keep both hands in frame. H, J and Y involve motion and aren\'t recognised yet.'}
              {lang === 'isl' && 'Mostly two-handed — keep both hands in frame. H, J and V aren\'t in the training data yet.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
