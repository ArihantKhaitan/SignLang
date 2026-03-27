import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

const glass = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.4)',
  borderRadius: '20px',
};

function tokenise(text) {
  const tokens = [];
  const words = text.toUpperCase().trim().split(/\s+/);
  words.forEach((word, wi) => {
    for (const ch of word) {
      if (/[A-Z0-9]/.test(ch)) tokens.push({ type: 'letter', value: ch });
    }
    if (wi < words.length-1) tokens.push({ type: 'space', value: ' ' });
  });
  return tokens;
}

function SignImage({ char, active }) {
  const [err, setErr] = useState(false);
  const src = `https://www.lifeprint.com/asl101/gifs-animated/${char.toLowerCase()}.gif`;
  return (
    <div style={{
      borderRadius:'20px', overflow:'hidden',
      boxShadow: active ? '0 0 40px rgba(124,58,237,0.5)' : 'none',
      transform: active ? 'scale(1.04)' : 'scale(1)',
      transition: 'transform 0.25s, box-shadow 0.25s',
      border: active ? '2px solid rgba(124,58,237,0.6)' : '2px solid transparent',
    }}>
      {!err ? (
        <img src={src} alt={`ASL ${char}`}
          style={{ width:220, height:220, objectFit:'contain', background:'#fff', display:'block' }}
          onError={()=>setErr(true)} />
      ) : (
        <div style={{ width:220, height:220, background:'rgba(124,58,237,0.08)', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'7rem', color:'#a78bfa', filter:'drop-shadow(0 0 20px rgba(124,58,237,0.5))' }}>{char}</span>
        </div>
      )}
    </div>
  );
}

const SPEED_OPTIONS = [
  { label:'0.5×', ms:2000 },
  { label:'1×',   ms:1000 },
  { label:'1.5×', ms:700  },
  { label:'2×',   ms:500  },
  { label:'3×',   ms:300  },
];

const SAMPLES = ['HELLO','THANK YOU','HOW ARE YOU','NICE TO MEET YOU','I LOVE ASL'];

export default function SignPlayer() {
  const [text, setText]     = useState('');
  const [tokens, setTokens] = useState([]);
  const [idx, setIdx]       = useState(-1);
  const [playing, setPlay]  = useState(false);
  const [speedIdx, setSpd]  = useState(1);
  const timerRef = useRef(null);
  const ms = SPEED_OPTIONS[speedIdx].ms;

  const advance = useCallback(() => {
    setIdx(prev => {
      const next = prev + 1;
      if (next >= tokens.length) { setPlay(false); return tokens.length-1; }
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
    const toks = tokenise(text);
    setTokens(toks); setIdx(-1); setPlay(false);
  };

  const play = () => {
    if (tokens.length===0) { load(); return; }
    if (idx>=tokens.length-1) setIdx(-1);
    setPlay(true);
  };

  const speak = () => {
    if (!text.trim()) return;
    fetch('/api/tts', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ text }) });
  };

  const currentToken = tokens[idx] ?? null;
  const progress = tokens.length>0 ? ((idx+1)/tokens.length)*100 : 0;

  return (
    <div style={{ maxWidth:'720px', margin:'0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom:'32px' }}>
        <span style={{ fontSize:'0.65rem', letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(139,92,246,0.85)', display:'block', marginBottom:'6px' }}>Text to Signs</span>
        <h1 className="display" style={{ fontSize:'clamp(2.5rem,6vw,4rem)' }}>SIGN PLAYER</h1>
        <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.88rem', marginTop:'8px', fontFamily:"'Space Grotesk',sans-serif" }}>Type text and watch it fingerspelled in ASL — letter by letter.</p>
      </div>

      {/* Input */}
      <div style={{ ...glass, padding:'20px', marginBottom:'16px' }}>
        <div style={{ display:'flex', gap:'10px', marginBottom:'12px' }}>
          <input value={text} onChange={e=>setText(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&(load(),setTimeout(play,50))}
            placeholder="Type anything — e.g. HELLO WORLD"
            style={{
              flex:1, background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:'12px', padding:'12px 16px', color:'#fff', fontSize:'0.9rem',
              outline:'none', fontFamily:"'Space Grotesk',sans-serif",
            }}
            onFocus={e=>{e.target.style.borderColor='rgba(124,58,237,0.5)';}}
            onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.1)';}}
          />
          <button onClick={()=>{ load(); setTimeout(play,50); }} style={{
            display:'flex', alignItems:'center', gap:'8px', padding:'12px 20px',
            borderRadius:'12px', background:'rgba(124,58,237,0.3)', border:'1px solid rgba(124,58,237,0.5)',
            color:'#fff', cursor:'pointer', fontSize:'0.85rem', fontWeight:600,
            transition:'all 0.15s', boxShadow:'0 0 20px rgba(124,58,237,0.2)',
          }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(124,58,237,0.45)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(124,58,237,0.3)';}}
          >
            <Play size={14}/> Play
          </button>
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
          {SAMPLES.map(s => (
            <button key={s} onClick={()=>setText(s)} style={{
              padding:'5px 12px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.08)',
              background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.45)', cursor:'pointer',
              fontSize:'0.72rem', transition:'all 0.15s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.color='#fff';e.currentTarget.style.background='rgba(255,255,255,0.08)';}}
              onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.45)';e.currentTarget.style.background='rgba(255,255,255,0.04)';}}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Player */}
      {tokens.length>0 && (
        <div style={{ ...glass, padding:'28px' }}>
          {/* Progress */}
          <div style={{ marginBottom:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', color:'rgba(255,255,255,0.3)', marginBottom:'6px' }}>
              <span>{idx>=0?`${idx+1} / ${tokens.length}`:'Ready'}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div style={{ width:'100%', height:'2px', background:'rgba(255,255,255,0.07)', borderRadius:'9999px', overflow:'hidden' }}>
              <div style={{ height:'100%', background:'linear-gradient(90deg,#7c3aed,#8b5cf6)', width:`${progress}%`, transition:'width 0.3s', boxShadow:'0 0 8px rgba(124,58,237,0.5)' }} />
            </div>
          </div>

          {/* Current sign */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'16px', padding:'16px 0 24px' }}>
            {currentToken?.type==='letter' ? (
              <>
                <SignImage char={currentToken.value} active />
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'4rem', lineHeight:1, filter:'drop-shadow(0 0 20px rgba(124,58,237,0.6))' }}>{currentToken.value}</span>
              </>
            ) : currentToken?.type==='space' ? (
              <div style={{ width:220, height:220, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                <div style={{ width:60, height:2, background:'rgba(255,255,255,0.15)', borderRadius:'9999px' }} />
                <span style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.25)' }}>— word break —</span>
              </div>
            ) : (
              <div style={{ width:220, height:220, background:'rgba(255,255,255,0.03)', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.2)' }}>Press play</span>
              </div>
            )}
          </div>

          {/* Token strip */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:'5px', justifyContent:'center', maxHeight:'60px', overflowY:'auto', marginBottom:'20px' }}>
            {tokens.map((t, i) => (
              <button key={i} onClick={()=>{ clearInterval(timerRef.current); setPlay(false); setIdx(i); }} style={{
                padding:'4px 8px', borderRadius:'6px', border:'none', cursor:'pointer',
                background: i===idx ? 'rgba(124,58,237,0.4)' : i<idx ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)',
                color: i===idx ? '#fff' : i<idx ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.55)',
                fontFamily:'monospace', fontWeight:'bold', fontSize:'0.75rem',
                transform: i===idx ? 'scale(1.15)' : 'scale(1)',
                boxShadow: i===idx ? '0 0 8px rgba(124,58,237,0.4)' : 'none',
                transition:'all 0.15s',
              }}>
                {t.type==='space'?'·':t.value}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexWrap:'wrap' }}>
            <div style={{ display:'flex', gap:'4px' }}>
              {SPEED_OPTIONS.map((s, i) => (
                <button key={i} onClick={()=>setSpd(i)} style={{
                  padding:'7px 10px', borderRadius:'8px', border:'none', cursor:'pointer',
                  background: speedIdx===i ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
                  color: speedIdx===i ? '#c4b5fd' : 'rgba(255,255,255,0.4)',
                  fontSize:'0.72rem', fontWeight:600, transition:'all 0.15s',
                }}>{s.label}</button>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <button onClick={speak} title="Speak aloud" style={{ width:38, height:38, borderRadius:'10px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';e.currentTarget.style.color='#fff';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color='rgba(255,255,255,0.5)';}}
              ><Volume2 size={14}/></button>
              <button onClick={()=>{ clearInterval(timerRef.current); setPlay(false); setIdx(-1); }} style={{ width:38, height:38, borderRadius:'10px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';e.currentTarget.style.color='#fff';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color='rgba(255,255,255,0.5)';}}
              ><RotateCcw size={14}/></button>
              <button onClick={playing?()=>setPlay(false):play} style={{
                display:'flex', alignItems:'center', gap:'8px', padding:'10px 20px',
                borderRadius:'12px', background:'rgba(124,58,237,0.3)', border:'1px solid rgba(124,58,237,0.5)',
                color:'#fff', cursor:'pointer', fontSize:'0.85rem', fontWeight:600, transition:'all 0.15s',
              }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(124,58,237,0.45)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(124,58,237,0.3)';}}
              >
                {playing ? <><Pause size={14}/> Pause</> : <><Play size={14}/> {idx>=0?'Resume':'Play'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
