import React, { useState, useEffect } from 'react';
import CameraView from '../components/CameraView';
import { StopCircle, CheckCircle, Circle } from 'lucide-react';

const glass = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.07)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: '20px',
};

const QUICK_LABELS = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M',
  'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  'SPACE','DEL','HELLO','THANKS','YES','NO',
];

const api = (path, opts) => fetch(`/api${path}`, opts);

export default function DataCollection() {
  const [label, setLabel]           = useState('');
  const [collecting, setCollecting] = useState(false);
  const [count, setCount]           = useState(0);
  const [target, setTarget]         = useState(300);
  const [sampleCounts, setSampleCounts] = useState({});
  const [justDone, setJustDone]     = useState(null);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const r = await api('/status');
        const d = await r.json();
        setSampleCounts(d.sample_counts || {});
        if (collecting) {
          setCount(d.collecting.count);
          if (!d.collecting.active) {
            setCollecting(false);
            setJustDone(d.collecting.label);
            setTimeout(() => setJustDone(null), 2500);
          }
        }
      } catch {}
    }, 400);
    return () => clearInterval(id);
  }, [collecting]);

  const start = async () => {
    const lbl = label.trim().toUpperCase();
    if (!lbl) return;
    await api('/capture/start', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ label:lbl, target }) });
    setCollecting(true); setCount(0);
  };

  const stop = () => api('/capture/stop', { method:'POST' }).then(() => setCollecting(false));
  const progress = target>0 ? Math.min((count/target)*100, 100) : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:'32px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
          <div style={{ width:'24px', height:'1px', background:'#7c3aed' }} />
          <span style={{ fontSize:'0.7rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#7c3aed' }}>Data Collection</span>
        </div>
        <h1 className="display" style={{ fontSize:'clamp(2.5rem,6vw,4rem)' }}>COLLECT</h1>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.9rem', marginTop:'6px', fontFamily:"'Space Grotesk',sans-serif" }}>Record gesture samples. The more you capture, the more accurate the model.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,3fr) minmax(0,2fr)', gap:'20px' }}
        className="collect-grid">

        {/* Camera */}
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          <div style={{ ...glass, overflow:'hidden', padding:0 }}>
            <CameraView overlay={
              collecting && (
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'rgba(255,255,255,0.7)', marginBottom:'6px' }}>
                    <span>Collecting <span style={{ color:'#c4b5fd', fontWeight:'bold' }}>{label.toUpperCase()}</span></span>
                    <span>{count} / {target}</span>
                  </div>
                  <div style={{ width:'100%', height:'3px', background:'rgba(255,255,255,0.1)', borderRadius:'9999px', overflow:'hidden' }}>
                    <div style={{ height:'100%', background:'linear-gradient(90deg,#7c3aed,#8b5cf6)', width:`${progress}%`, transition:'width 0.2s', boxShadow:'0 0 8px rgba(124,58,237,0.5)' }} />
                  </div>
                </div>
              )
            } />
          </div>

          {justDone && (
            <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#34d399', fontSize:'0.85rem', padding:'10px 14px', background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:'10px' }}>
              <CheckCircle size={15}/> Done collecting <strong>{justDone}</strong>!
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div style={{ ...glass, padding:'20px' }}>
            <span style={{ fontSize:'0.68rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', display:'block', marginBottom:'16px' }}>
              Select Gesture
            </span>

            {/* Quick pick */}
            <p style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.3)', marginBottom:'8px', letterSpacing:'0.1em', textTransform:'uppercase' }}>Quick select</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'5px', marginBottom:'16px' }}>
              {QUICK_LABELS.map(l => (
                <button key={l} onClick={()=>setLabel(l)} style={{
                  padding:'5px 8px', borderRadius:'7px', border:'none', cursor:'pointer',
                  background: label===l ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.06)',
                  color: label===l ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                  fontFamily:'monospace', fontWeight:'bold', fontSize:'0.72rem',
                  border: `1px solid ${label===l ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: label===l ? '0 0 8px rgba(124,58,237,0.2)' : 'none',
                  transition:'all 0.12s',
                }}>{l}</button>
              ))}
            </div>

            {/* Custom label */}
            <p style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.3)', marginBottom:'6px', letterSpacing:'0.1em', textTransform:'uppercase' }}>Custom label</p>
            <input value={label} onChange={e=>setLabel(e.target.value.toUpperCase())}
              placeholder="e.g. PEACE, THUMBS_UP"
              style={{ width:'100%', background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'10px 14px', color:'#fff', fontSize:'0.85rem', outline:'none', marginBottom:'16px', fontFamily:"'Space Grotesk',sans-serif", boxSizing:'border-box' }}
              onFocus={e=>{e.target.style.borderColor='rgba(124,58,237,0.5)';}}
              onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.1)';}}
            />

            {/* Target */}
            <p style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.3)', marginBottom:'6px', letterSpacing:'0.1em', textTransform:'uppercase' }}>
              Samples: <span style={{ color:'rgba(255,255,255,0.7)' }}>{target}</span>
            </p>
            <input type="range" min={60} max={600} step={30} value={target} onChange={e=>setTarget(+e.target.value)}
              style={{ width:'100%', accentColor:'#7c3aed', marginBottom:'4px' }} />
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.65rem', color:'rgba(255,255,255,0.2)', marginBottom:'16px' }}>
              <span>60 (~3s)</span><span>300 (~15s)</span><span>600 (~30s)</span>
            </div>

            {/* Start/Stop */}
            {collecting ? (
              <button onClick={stop} style={{
                width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                padding:'13px', borderRadius:'12px', background:'rgba(239,68,68,0.2)', border:'1px solid rgba(239,68,68,0.4)',
                color:'#f87171', cursor:'pointer', fontSize:'0.9rem', fontWeight:600, transition:'all 0.15s',
              }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.3)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,0.2)';}}
              >
                <StopCircle size={16}/> Stop Capture
              </button>
            ) : (
              <button onClick={start} disabled={!label.trim()} style={{
                width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                padding:'13px', borderRadius:'12px', background: label.trim()?'rgba(124,58,237,0.3)':'rgba(255,255,255,0.04)',
                border:`1px solid ${label.trim()?'rgba(124,58,237,0.5)':'rgba(255,255,255,0.07)'}`,
                color: label.trim()?'#c4b5fd':'rgba(255,255,255,0.25)', cursor:label.trim()?'pointer':'default',
                fontSize:'0.9rem', fontWeight:600, transition:'all 0.15s',
                boxShadow: label.trim()?'0 0 20px rgba(124,58,237,0.15)':'none',
              }}
                onMouseEnter={e=>{ if(label.trim()) e.currentTarget.style.background='rgba(124,58,237,0.45)'; }}
                onMouseLeave={e=>{ if(label.trim()) e.currentTarget.style.background='rgba(124,58,237,0.3)'; }}
              >
                <Circle size={16}/> Start Capture
              </button>
            )}

            <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.25)', marginTop:'12px', lineHeight:1.6 }}>
              Hold the sign steady while capturing. Slight hand variations improve accuracy.
            </p>
          </div>

          {/* Collected summary */}
          {Object.keys(sampleCounts).length>0 && (
            <div style={{ ...glass, padding:'18px' }}>
              <span style={{ fontSize:'0.68rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', display:'block', marginBottom:'12px' }}>
                Collected Gestures
              </span>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'240px', overflowY:'auto' }}>
                {Object.entries(sampleCounts).sort().map(([lbl, cnt]) => (
                  <div key={lbl} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <span style={{ fontSize:'0.72rem', fontFamily:'monospace', fontWeight:'bold', color:'#a78bfa', width:'52px', flexShrink:0 }}>{lbl}</span>
                    <div style={{ flex:1, height:'3px', background:'rgba(255,255,255,0.06)', borderRadius:'9999px', overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:'9999px', background:cnt>=100?'#34d399':cnt>=50?'#fbbf24':'#f87171', width:`${Math.min((cnt/300)*100,100)}%`, transition:'width 0.3s' }} />
                    </div>
                    <span style={{ fontSize:'0.7rem', width:'32px', textAlign:'right', color:cnt>=100?'#34d399':cnt>=50?'#fbbf24':'#f87171' }}>{cnt}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.2)', marginTop:'10px' }}>Green ≥100 samples (good). Orange ≥50. Red &lt;50 may reduce accuracy.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
