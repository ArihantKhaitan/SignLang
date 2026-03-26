import React, { useState, useEffect, useRef } from 'react';
import CameraView from '../components/CameraView';
import { Volume2, VolumeX, Trash2, Delete, Info } from 'lucide-react';

const glass = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.07)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: '20px',
};

const HoldRing = ({ progress }) => {
  const r = 42, circ = 2 * Math.PI * r;
  const filled = circ * Math.min(progress, 1);
  const color = progress >= 1 ? '#34d399' : '#7c3aed';
  return (
    <svg width="100" height="100"
      style={{ position:'absolute', top:0, left:0, right:0, bottom:0, margin:'auto', transform:'rotate(-90deg)' }}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      {progress > 0 && (
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{ transition:'stroke-dasharray 0.12s linear, stroke 0.2s', filter:`drop-shadow(0 0 8px ${color})` }} />
      )}
    </svg>
  );
};

const api = (path, opts) => fetch(`/api${path}`, opts);

export default function Interpreter() {
  const [state, setState] = useState({
    prediction: '', confidence: 0, hand_detected: false,
    sentence_state: { current_letter: null, hold_progress: 0, current_word: '', words: [], full_text: '', sentence: '' },
  });
  const [voiceOn, setVoiceOn] = useState(true);
  const [flash, setFlash] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const prevText = useRef('');

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const r = await api('/predict');
        const d = await r.json();
        setState(d);
        if (d.sentence_state.full_text !== prevText.current) {
          prevText.current = d.sentence_state.full_text;
          setFlash(true);
          setTimeout(() => setFlash(false), 250);
        }
      } catch {}
    }, 150);
    return () => clearInterval(id);
  }, []);

  const clear     = () => api('/sentence/clear',    { method: 'POST' });
  const backspace = () => api('/sentence/backspace', { method: 'POST' });
  const space     = () => api('/sentence/space',     { method: 'POST' });

  const speak = async () => {
    const text = state.sentence_state.full_text;
    if (!text) return;
    setSpeaking(true);
    await api('/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    setTimeout(() => setSpeaking(false), 1500);
  };

  const { prediction, confidence, hand_detected, sentence_state: ss } = state;
  const pct = Math.round(confidence * 100);

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
          <div style={{ width:'24px', height:'1px', background:'#7c3aed' }} />
          <span style={{ fontSize:'0.7rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#7c3aed' }}>Live Recognition</span>
        </div>
        <h1 className="display" style={{ fontSize:'clamp(2.5rem,6vw,4rem)' }}>INTERPRETER</h1>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'20px' }}
        className="lg:grid-cols-interpreter">
        <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'20px' }}
          className="interpreter-grid">

          {/* Camera */}
          <div style={{ gridColumn:'1 / -1' }}>
            {/* inner two-col layout */}
            <div style={{ display:'grid', gap:'20px', gridTemplateColumns:'minmax(0,3fr) minmax(0,2fr)' }}
              className="interpreter-inner">

              {/* Camera col */}
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                <div style={{ ...glass, overflow:'hidden', padding:0 }}>
                  <CameraView />
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', paddingLeft:'4px' }}>
                  <div style={{
                    width:8, height:8, borderRadius:'50%',
                    background: hand_detected ? '#34d399' : 'rgba(255,255,255,0.2)',
                    boxShadow: hand_detected ? '0 0 8px #34d39980' : 'none',
                  }} />
                  <span style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.35)', letterSpacing:'0.05em' }}>
                    {hand_detected ? 'Hand detected — MediaPipe active' : 'No hand in frame'}
                  </span>
                </div>
              </div>

              {/* Right panel col */}
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

                {/* Detected sign */}
                <div style={{ ...glass, padding:'20px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                    <span style={{ fontSize:'0.68rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)' }}>
                      Detected Sign
                    </span>
                    <button onClick={() => setVoiceOn(v => !v)} style={{
                      width:32, height:32, borderRadius:'8px', border:'none', cursor:'pointer',
                      background: voiceOn ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.05)',
                      color: voiceOn ? '#a78bfa' : 'rgba(255,255,255,0.3)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}>
                      {voiceOn ? <Volume2 size={14}/> : <VolumeX size={14}/>}
                    </button>
                  </div>

                  <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'140px', background:'rgba(0,0,0,0.3)', borderRadius:'12px', padding:'16px' }}>
                    <HoldRing progress={ss.hold_progress} />
                    {prediction ? (
                      <div style={{ zIndex:1, textAlign:'center' }}>
                        <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'5rem', lineHeight:1, display:'block', filter:`drop-shadow(0 0 20px rgba(124,58,237,0.6))` }}>
                          {prediction}
                        </span>
                        <div style={{ marginTop:'8px' }}>
                          <div style={{ width:'100px', height:'3px', background:'rgba(255,255,255,0.08)', borderRadius:'9999px', margin:'0 auto', overflow:'hidden' }}>
                            <div style={{
                              height:'100%', borderRadius:'9999px',
                              background: pct>85 ? '#34d399' : pct>65 ? '#fbbf24' : '#f87171',
                              width:`${pct}%`, transition:'width 0.2s',
                            }} />
                          </div>
                          <span style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.3)', marginTop:'4px', display:'block' }}>{pct}% confidence</span>
                          {ss.hold_progress > 0 && (
                            <span style={{ fontSize:'0.72rem', color: ss.hold_progress>=1 ? '#34d399' : '#a78bfa', marginTop:'4px', display:'block' }}>
                              {ss.hold_progress>=1 ? '✓ Registered!' : `Holding ${Math.round(ss.hold_progress*100)}%`}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.2)', zIndex:1 }}>Sign something…</span>
                    )}
                  </div>
                </div>

                {/* Sentence builder */}
                <div style={{ ...glass, padding:'20px', flex:1 }}>
                  <span style={{ fontSize:'0.68rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', display:'block', marginBottom:'12px' }}>
                    Sentence Builder
                  </span>

                  {ss.current_word && (
                    <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'4px', marginBottom:'8px' }}>
                      <span style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.3)' }}>Spelling:</span>
                      {ss.current_word.split('').map((ch, i) => (
                        <span key={i} style={{
                          padding:'2px 6px', borderRadius:'4px',
                          background:'rgba(124,58,237,0.2)', color:'#c4b5fd',
                          fontSize:'0.8rem', fontFamily:'monospace', fontWeight:'bold',
                        }}>{ch}</span>
                      ))}
                      <span style={{ display:'inline-block', width:2, height:16, background:'#7c3aed', animation:'beamPulse 1s ease-in-out infinite' }} />
                    </div>
                  )}

                  <div style={{
                    minHeight:'70px', background:'rgba(0,0,0,0.3)', borderRadius:'10px', padding:'12px', marginBottom:'12px',
                    border: flash ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
                    transition:'border-color 0.15s',
                  }}>
                    {ss.words.length>0 || ss.current_word ? (
                      <p style={{ fontSize:'0.95rem', lineHeight:1.6, fontFamily:"'Space Grotesk',sans-serif" }}>
                        {ss.words.map((w, i) => <span key={i}>{w} </span>)}
                        {ss.current_word && (
                          <span style={{ color:'#c4b5fd', textDecoration:'underline', textDecorationStyle:'dashed' }}>{ss.current_word}</span>
                        )}
                      </p>
                    ) : (
                      <span style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.2)' }}>Your sentence will appear here…</span>
                    )}
                  </div>

                  {/* Controls */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px' }}>
                    {[
                      { label:'Del', icon:<Delete size={13}/>, fn: backspace, style:{} },
                      { label:'Space', icon:null, fn: space, style:{} },
                      { label: speaking?'Speaking…':'Speak', icon:<Volume2 size={13}/>, fn: speak, style:{ background: speaking?'rgba(52,211,153,0.2)':'rgba(124,58,237,0.25)', color: speaking?'#34d399':'#a78bfa', border:`1px solid ${speaking?'rgba(52,211,153,0.4)':'rgba(124,58,237,0.4)'}` }},
                      { label:'', icon:<Trash2 size={13}/>, fn: clear, style:{ color:'rgba(255,255,255,0.3)' }},
                    ].map(({ label, icon, fn, style: s }, i) => (
                      <button key={i} onClick={fn} style={{
                        display:'flex', alignItems:'center', justifyContent:'center', gap:'4px',
                        padding:'10px 4px', borderRadius:'10px',
                        background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)',
                        color:'rgba(255,255,255,0.6)', fontSize:'0.72rem', cursor:'pointer',
                        transition:'all 0.15s', ...s,
                      }}
                        onMouseEnter={e => { if (!s.background) e.currentTarget.style.background='rgba(255,255,255,0.08)'; }}
                        onMouseLeave={e => { if (!s.background) e.currentTarget.style.background='rgba(255,255,255,0.05)'; }}
                      >
                        {icon}{label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div style={{ ...glass, padding:'14px', fontSize:'0.72rem', color:'rgba(255,255,255,0.35)', lineHeight:1.7 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px', color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.15em', fontSize:'0.62rem' }}>
                    <Info size={11}/> Tips
                  </div>
                  <p>Hold sign <span style={{ color:'rgba(255,255,255,0.55)' }}>1.5s</span> to register &nbsp;·&nbsp; Pause <span style={{ color:'rgba(255,255,255,0.55)' }}>2s</span> for word break &nbsp;·&nbsp; Train SPACE/DEL signs for hands-free use</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
