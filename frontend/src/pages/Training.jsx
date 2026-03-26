import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const glass = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.07)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: '20px',
};

export default function Training() {
  const [status, setStatus]     = useState(null);
  const [training, setTraining] = useState(false);
  const [result, setResult]     = useState(null);
  const [message, setMessage]   = useState('');

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const r = await fetch('/api/status');
        const d = await r.json();
        setStatus(d);
        if (training) {
          if (!d.training.active) {
            setTraining(false);
            setResult(d.training.result);
            setMessage(d.training.message);
          }
        }
      } catch {}
    }, 600);
    return () => clearInterval(id);
  }, [training]);

  const startTraining = async () => {
    setResult(null); setMessage(''); setTraining(true);
    try {
      const r = await fetch('/api/train', { method:'POST' });
      if (!r.ok) {
        const d = await r.json();
        setTraining(false); setResult('error'); setMessage(d.error || 'Training failed');
      }
    } catch {
      setTraining(false); setResult('error'); setMessage('Could not reach backend');
    }
  };

  const counts  = status?.sample_counts || {};
  const labels  = status?.labels || [];
  const ready   = status?.model_ready;
  const entries = Object.entries(counts).sort();

  return (
    <div style={{ maxWidth:'680px', margin:'0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom:'32px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
          <div style={{ width:'24px', height:'1px', background:'#7c3aed' }} />
          <span style={{ fontSize:'0.7rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#7c3aed' }}>Machine Learning</span>
        </div>
        <h1 className="display" style={{ fontSize:'clamp(2.5rem,6vw,4rem)' }}>TRAIN MODEL</h1>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.9rem', marginTop:'6px', fontFamily:"'Space Grotesk',sans-serif" }}>Fits a RandomForest classifier on collected landmark data. Under 5 seconds. No GPU required.</p>
      </div>

      {/* Main card */}
      <div style={{ ...glass, padding:'40px', textAlign:'center', marginBottom:'16px' }}>
        {/* Icon */}
        <div style={{
          width:72, height:72, borderRadius:'18px',
          background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)',
          display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px',
          boxShadow:'0 0 30px rgba(124,58,237,0.15)',
        }}>
          {training
            ? <Loader size={32} style={{ color:'#a78bfa', animation:'spin 1s linear infinite' }} />
            : <Brain size={32} style={{ color:'#a78bfa' }} />}
        </div>

        {/* Status */}
        {training && (
          <div style={{ marginBottom:'24px' }}>
            <p style={{ color:'#c4b5fd', fontWeight:600, marginBottom:'6px', animation:'nebulaPulse 1.5s ease-in-out infinite' }}>Training in progress…</p>
            <p style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.3)' }}>Fitting 250 trees — this is fast!</p>
          </div>
        )}

        {result==='success' && (
          <div style={{ marginBottom:'24px', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
            <CheckCircle size={40} style={{ color:'#34d399', filter:'drop-shadow(0 0 12px rgba(52,211,153,0.5))' }} />
            <p style={{ color:'#34d399', fontWeight:700, fontSize:'1.1rem' }}>Training complete!</p>
            <p style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.45)', maxWidth:'340px' }}>{message}</p>
          </div>
        )}

        {result==='error' && (
          <div style={{ marginBottom:'24px', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
            <AlertCircle size={40} style={{ color:'#f87171' }} />
            <p style={{ color:'#f87171', fontWeight:700 }}>Training failed</p>
            <p style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.4)', maxWidth:'340px' }}>{message}</p>
          </div>
        )}

        <button onClick={startTraining} disabled={training||entries.length===0} style={{
          padding:'14px 40px', borderRadius:'9999px',
          background: (training||entries.length===0) ? 'rgba(255,255,255,0.05)' : 'rgba(124,58,237,0.3)',
          border:`1px solid ${(training||entries.length===0)?'rgba(255,255,255,0.08)':'rgba(124,58,237,0.5)'}`,
          color: (training||entries.length===0) ? 'rgba(255,255,255,0.25)' : '#c4b5fd',
          cursor: (training||entries.length===0) ? 'default' : 'pointer',
          fontSize:'0.9rem', fontWeight:700, letterSpacing:'0.06em',
          boxShadow: (training||entries.length===0) ? 'none' : '0 0 24px rgba(124,58,237,0.2)',
          transition:'all 0.2s',
        }}
          onMouseEnter={e=>{ if(!(training||entries.length===0)) { e.currentTarget.style.background='rgba(124,58,237,0.45)'; e.currentTarget.style.boxShadow='0 0 30px rgba(124,58,237,0.4)'; e.currentTarget.style.transform='translateY(-1px)'; } }}
          onMouseLeave={e=>{ e.currentTarget.style.background=(training||entries.length===0)?'rgba(255,255,255,0.05)':'rgba(124,58,237,0.3)'; e.currentTarget.style.boxShadow=(training||entries.length===0)?'none':'0 0 24px rgba(124,58,237,0.2)'; e.currentTarget.style.transform='none'; }}
        >
          {training ? 'Training…' : result==='success' ? 'Re-train' : 'Start Training'}
        </button>
      </div>

      {/* Data summary */}
      {entries.length>0 ? (
        <div style={{ ...glass, padding:'20px', marginBottom:'12px' }}>
          <span style={{ fontSize:'0.68rem', letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', display:'block', marginBottom:'14px' }}>
            Training Data — {entries.length} gesture{entries.length!==1?'s':''}
          </span>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {entries.map(([lbl, cnt]) => (
              <div key={lbl} style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <span style={{ fontSize:'0.75rem', fontFamily:'monospace', fontWeight:'bold', color:'#a78bfa', width:'56px', flexShrink:0 }}>{lbl}</span>
                <div style={{ flex:1, height:'4px', background:'rgba(255,255,255,0.06)', borderRadius:'9999px', overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:'9999px', background:cnt>=100?'#34d399':cnt>=50?'#fbbf24':'#f87171', width:`${Math.min((cnt/300)*100,100)}%`, transition:'width 0.4s', boxShadow:`0 0 6px ${cnt>=100?'rgba(52,211,153,0.4)':cnt>=50?'rgba(251,191,36,0.4)':'rgba(248,113,113,0.4)'}` }} />
                </div>
                <span style={{ fontSize:'0.75rem', width:'36px', textAlign:'right', color:cnt>=100?'#34d399':cnt>=50?'#fbbf24':'#f87171', fontWeight:600 }}>{cnt}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.2)', marginTop:'12px' }}>
            Green ≥100 samples (recommended) · Orange ≥50 · Red &lt;50 may hurt accuracy
          </p>
        </div>
      ) : (
        <div style={{ ...glass, padding:'32px', textAlign:'center', borderStyle:'dashed' }}>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.9rem' }}>No training data yet.</p>
          <p style={{ color:'rgba(255,255,255,0.2)', fontSize:'0.78rem', marginTop:'6px' }}>
            Go to <strong style={{ color:'rgba(255,255,255,0.4)' }}>Collect</strong> and capture samples for each gesture first.
          </p>
        </div>
      )}

      {ready && labels.length>0 && (
        <div style={{ padding:'14px 18px', borderRadius:'12px', background:'rgba(52,211,153,0.06)', border:'1px solid rgba(52,211,153,0.15)', color:'#34d399', fontSize:'0.82rem', display:'flex', alignItems:'flex-start', gap:'8px' }}>
          <CheckCircle size={15} style={{ flexShrink:0, marginTop:'1px' }} />
          <span>Active model recognises: <strong>{labels.join(', ')}</strong></span>
        </div>
      )}
    </div>
  );
}
