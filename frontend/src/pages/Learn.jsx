import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Trophy, BookOpen, Layers, X } from 'lucide-react';

const glass = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.07)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: '16px',
};

const IMG = l => `https://www.lifeprint.com/asl101/gifs-animated/${l.toLowerCase()}.gif`;

const ALPHABET = {
  A: { desc: 'Closed fist. Thumb rests against the side of the curled fingers, pointing up.', tips: 'Thumb to the side, not on top', similar: ['S','E'] },
  B: { desc: 'Four fingers straight up and together. Thumb folded flat across the palm.', tips: 'Fingers flat and pressed together', similar: [] },
  C: { desc: 'Curve all fingers and thumb to form a C shape.', tips: 'Rounded like the letter C', similar: ['O'] },
  D: { desc: 'Index finger points up. Other fingers and thumb form a circle around it.', tips: 'Only index points up; rest form an O', similar: [] },
  E: { desc: 'All four fingers bend down so fingertips rest on the top of the thumb.', tips: 'All fingertips touch the thumb', similar: ['A','S'] },
  F: { desc: 'Index and thumb touch to form a small O. Other three fingers point straight up.', tips: 'Three fingers spread slightly upward', similar: [] },
  G: { desc: 'Index finger and thumb both point sideways. Other fingers closed.', tips: 'Like pointing a gun sideways', similar: ['H','Q'] },
  H: { desc: 'Index and middle fingers extend horizontally together, pointing to the side.', tips: 'Two fingers side by side pointing sideways', similar: ['G','U'] },
  I: { desc: 'Pinky finger extends straight up. All other fingers curled into a fist.', tips: 'Only the pinky stands up', similar: ['J','Y'] },
  J: { desc: 'Start with I (pinky up), then trace the letter J in the air.', tips: 'Motion sign — trace a J downward then hook', similar: ['I'] },
  K: { desc: 'Index and middle fingers point up in a V. Thumb is placed between them touching the middle of the index finger.', tips: 'Thumb between index and middle', similar: ['P','V'] },
  L: { desc: 'Index finger points straight up. Thumb extends sideways. Forms an L shape.', tips: 'Clean right angle between index and thumb', similar: [] },
  M: { desc: 'Three fingers (index, middle, ring) fold over and rest in front of the thumb.', tips: 'Three humps = M', similar: ['N'] },
  N: { desc: 'Index and middle fingers fold over and rest in front of the thumb.', tips: 'Two humps = N', similar: ['M'] },
  O: { desc: 'All fingers and thumb curve to touch at their tips, forming a full O.', tips: 'All fingertips touch the thumb tip', similar: ['C'] },
  P: { desc: 'Like K but the whole hand rotates so fingers point downward.', tips: 'K shape pointing down', similar: ['K'] },
  Q: { desc: 'Index finger and thumb both point downward. Like G facing down.', tips: 'G shape pointing down', similar: ['G'] },
  R: { desc: 'Index and middle fingers cross over each other, both pointing up.', tips: 'Cross your index and middle fingers', similar: [] },
  S: { desc: 'Closed fist with the thumb wrapped across the front of all four curled fingers.', tips: 'Thumb crosses in front, unlike A', similar: ['A','E'] },
  T: { desc: 'Thumb is tucked between the index and middle finger, visible from the front.', tips: 'Thumb peeks between index and middle', similar: [] },
  U: { desc: 'Index and middle fingers extend straight up together. Ring and pinky folded.', tips: 'Two fingers together pointing up', similar: ['H','V'] },
  V: { desc: 'Index and middle fingers spread open in a V (peace sign). Ring and pinky folded.', tips: 'Classic peace / victory sign', similar: ['U','K'] },
  W: { desc: 'Index, middle, and ring fingers spread open upward. Pinky and thumb touch.', tips: 'Three fingers up and spread', similar: [] },
  X: { desc: 'Index finger hooks or bends like a fishhook. All other fingers closed.', tips: 'Just the index finger bent', similar: [] },
  Y: { desc: 'Thumb and pinky extend outward. Index, middle, ring fingers closed.', tips: 'Shaka / hang-loose sign', similar: ['I'] },
  Z: { desc: 'Index finger traces a Z shape in the air.', tips: 'Motion sign — draw a Z', similar: [] },
};

const NUMBERS = {
  '0': { desc: 'All fingers and thumb curve together to form a round O shape.', tips: 'Like the letter O' },
  '1': { desc: 'Index finger points straight up. All other fingers and thumb closed.', tips: 'Classic "one"' },
  '2': { desc: 'Index and middle fingers point up in a V. Thumb and other fingers closed.', tips: 'Like the letter V / peace' },
  '3': { desc: 'Index, middle, and thumb extended. Ring and pinky folded.', tips: 'Three fingers out' },
  '4': { desc: 'Four fingers straight up together, thumb folded across palm.', tips: 'Like B but four fingers' },
  '5': { desc: 'All five fingers spread open wide.', tips: 'Open hand, fingers spread' },
  '6': { desc: 'Pinky and thumb touch. Other three fingers point up.', tips: 'Combo of W + touch' },
  '7': { desc: 'Ring finger and thumb touch. Other fingers point up.', tips: 'Ring + thumb' },
  '8': { desc: 'Middle finger and thumb touch. Other fingers point up.', tips: 'Middle + thumb' },
  '9': { desc: 'Index and thumb form a small circle. Other fingers point up.', tips: 'Like F / the number 9' },
};

const PHRASES = [
  { sign: 'Hello', desc: 'Open hand, fingers together, palm forward. Move hand away from forehead like a salute.', category: 'Greetings' },
  { sign: 'Thank You', desc: 'Flat hand starts at chin, fingers touching lips, then moves forward and down.', category: 'Greetings' },
  { sign: 'Please', desc: 'Flat hand on chest, rub in a circular motion.', category: 'Polite' },
  { sign: 'Sorry', desc: 'Fist on chest, move in a circular motion.', category: 'Polite' },
  { sign: 'Yes', desc: 'Fist nods up and down like a head nodding yes.', category: 'Responses' },
  { sign: 'No', desc: 'Index and middle fingers quickly close to thumb twice.', category: 'Responses' },
  { sign: 'Help', desc: 'Thumb up (A hand) on flat palm, move both hands upward together.', category: 'Essential' },
  { sign: 'Stop', desc: 'Flat hand chops down onto the palm of the other flat hand.', category: 'Essential' },
  { sign: 'More', desc: 'Both hands form flat O shapes, tap fingertips together twice.', category: 'Essential' },
  { sign: 'Good', desc: 'Flat hand starts at mouth, then moves outward and downward.', category: 'Emotions' },
  { sign: 'Bad', desc: 'Flat hand at mouth, then flips outward and downward with palm facing down.', category: 'Emotions' },
  { sign: 'Love', desc: 'Cross arms over chest like a hug.', category: 'Emotions' },
  { sign: 'Water', desc: 'W hand (3 fingers up) taps chin twice.', category: 'Everyday' },
  { sign: 'Eat / Food', desc: 'Flat O hand taps mouth twice.', category: 'Everyday' },
  { sign: 'Where', desc: 'Index finger points and waves side to side.', category: 'Questions' },
  { sign: 'What', desc: 'Index finger brushes across fingers of the other hand.', category: 'Questions' },
  { sign: 'Who', desc: 'L hand at chin, middle finger taps chin.', category: 'Questions' },
];

function SignImage({ letter, size = 'md' }) {
  const [err, setErr] = useState(false);
  const dim = size === 'lg' ? 140 : 72;
  if (err) return (
    <div style={{ width:dim, height:dim, background:'rgba(124,58,237,0.1)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize: size==='lg'?'3rem':'1.8rem', color:'#a78bfa' }}>{letter}</span>
    </div>
  );
  return (
    <img src={IMG(letter)} alt={`ASL ${letter}`}
      style={{ width:dim, height:dim, objectFit:'contain', borderRadius:'10px', background:'#fff', display:'block' }}
      onError={() => setErr(true)} />
  );
}

function LetterCard({ letter, data, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={() => onClick(letter)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        ...glass,
        padding:'14px 8px', display:'flex', flexDirection:'column', alignItems:'center', gap:'8px',
        cursor:'pointer', background: hov ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.04)',
        border: hov ? '1px solid rgba(124,58,237,0.35)' : '1px solid rgba(255,255,255,0.07)',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition:'all 0.18s', boxShadow: hov ? '0 8px 24px rgba(124,58,237,0.15)' : 'none',
      }}>
      <SignImage letter={letter} size="md" />
      <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.4rem', letterSpacing:'0.05em' }}>{letter}</span>
      {data.similar?.length > 0 && (
        <span style={{ fontSize:'0.62rem', color:'rgba(255,255,255,0.25)' }}>cf. {data.similar.join(', ')}</span>
      )}
    </button>
  );
}

function DetailModal({ letter, data, onClose, onPrev, onNext }) {
  if (!letter) return null;
  const letters = Object.keys(ALPHABET);
  const idx = letters.indexOf(letter);
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', padding:'16px' }}>
      <div onClick={e => e.stopPropagation()} style={{
        ...glass, padding:'32px', maxWidth:'440px', width:'100%',
        background:'rgba(5,2,32,0.9)', borderRadius:'24px', boxShadow:'0 24px 80px rgba(0,0,0,0.7)',
        position:'relative',
      }}>
        <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'rgba(255,255,255,0.06)', border:'none', borderRadius:'8px', width:32, height:32, cursor:'pointer', color:'rgba(255,255,255,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <X size={14}/>
        </button>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
          <div>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'4rem', lineHeight:1, filter:'drop-shadow(0 0 20px rgba(124,58,237,0.5))' }}>{letter}</span>
            <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.3)', marginTop:'4px' }}>Letter {idx+1} of {letters.length}</p>
          </div>
          <SignImage letter={letter} size="lg" />
        </div>
        <p style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.9rem', lineHeight:1.7, marginBottom:'14px' }}>{data.desc}</p>
        {data.tips && (
          <div style={{ background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.25)', borderRadius:'10px', padding:'12px 16px', fontSize:'0.85rem', color:'#c4b5fd', marginBottom:'12px' }}>
            💡 {data.tips}
          </div>
        )}
        {data.similar?.length>0 && (
          <p style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.3)' }}>Often confused with: {data.similar.join(', ')}</p>
        )}
        <div style={{ display:'flex', gap:'10px', marginTop:'20px' }}>
          {[
            { label:<><ChevronLeft size={14}/> Prev</>, fn:onPrev, disabled:idx===0 },
            { label:'Close', fn:onClose, disabled:false },
            { label:<>Next <ChevronRight size={14}/></>, fn:onNext, disabled:idx===letters.length-1 },
          ].map(({ label, fn, disabled }, i) => (
            <button key={i} onClick={fn} disabled={disabled} style={{
              flex:1, padding:'10px', borderRadius:'10px', border:'none', cursor:disabled?'default':'pointer',
              background:'rgba(255,255,255,0.06)', color: disabled?'rgba(255,255,255,0.2)':'rgba(255,255,255,0.7)',
              fontSize:'0.8rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px',
              transition:'background 0.15s',
            }}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

const QUIZ_SIZE = 10;
function shuffle(arr) { return [...arr].sort(() => Math.random()-0.5); }
function makeQuestion(letters) {
  const correct = letters[Math.floor(Math.random()*letters.length)];
  const distractors = shuffle(letters.filter(l=>l!==correct)).slice(0,3);
  return { correct, choices: shuffle([correct,...distractors]) };
}

function Quiz() {
  const letters = Object.keys(ALPHABET);
  const [questions] = useState(() => Array.from({ length:QUIZ_SIZE }, ()=>makeQuestion(letters)));
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSel] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = questions[qIdx];

  const answer = useCallback((choice) => {
    if (selected) return;
    setSel(choice);
    if (choice===q.correct) setScore(s=>s+1);
    setTimeout(() => {
      if (qIdx+1>=QUIZ_SIZE) setDone(true);
      else { setQIdx(i=>i+1); setSel(null); }
    }, 900);
  }, [selected, q, qIdx]);

  const restart = () => { setQIdx(0); setSel(null); setScore(0); setDone(false); };

  if (done) {
    const pct = Math.round((score/QUIZ_SIZE)*100);
    return (
      <div style={{ maxWidth:'360px', margin:'0 auto', textAlign:'center', padding:'48px 0' }}>
        <Trophy size={56} style={{ margin:'0 auto 16px', color: pct>=70?'#fbbf24':'rgba(255,255,255,0.2)' }} />
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'4rem' }}>{score}/{QUIZ_SIZE}</div>
        <p style={{ color:'rgba(255,255,255,0.5)', marginBottom:'24px' }}>
          {pct===100?'Perfect! You know your ASL alphabet!':pct>=70?'Great job! Keep practising.':"Keep studying — you'll get there!"}
        </p>
        <button onClick={restart} style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'12px 28px', borderRadius:'9999px', background:'rgba(124,58,237,0.25)', border:'1px solid rgba(124,58,237,0.4)', color:'#c4b5fd', cursor:'pointer', fontSize:'0.85rem' }}>
          <RotateCcw size={14}/> Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:'360px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'20px' }}>
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', color:'rgba(255,255,255,0.35)', marginBottom:'6px' }}>
          <span>Question {qIdx+1} / {QUIZ_SIZE}</span>
          <span>Score: {score}</span>
        </div>
        <div style={{ width:'100%', height:'2px', background:'rgba(255,255,255,0.07)', borderRadius:'9999px', overflow:'hidden' }}>
          <div style={{ height:'100%', background:'#7c3aed', width:`${(qIdx/QUIZ_SIZE)*100}%`, transition:'width 0.3s' }} />
        </div>
      </div>
      <div style={{ display:'flex', justifyContent:'center' }}>
        <div style={{ background:'#fff', borderRadius:'16px', padding:'16px', boxShadow:'0 0 40px rgba(124,58,237,0.25)' }}>
          <img src={IMG(q.correct)} alt="?" style={{ width:160, height:160, objectFit:'contain', display:'block' }} onError={e=>{e.target.style.display='none';}} />
        </div>
      </div>
      <p style={{ textAlign:'center', fontSize:'0.82rem', color:'rgba(255,255,255,0.4)' }}>Which letter is this?</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
        {q.choices.map(ch => {
          let bg='rgba(255,255,255,0.05)', col='#fff', brd='rgba(255,255,255,0.1)';
          if (selected) {
            if (ch===q.correct) { bg='rgba(52,211,153,0.2)'; brd='rgba(52,211,153,0.5)'; col='#34d399'; }
            else if (ch===selected) { bg='rgba(248,113,113,0.2)'; brd='rgba(248,113,113,0.5)'; col='#f87171'; }
            else { bg='rgba(255,255,255,0.03)'; col='rgba(255,255,255,0.25)'; }
          }
          return (
            <button key={ch} onClick={()=>answer(ch)} style={{ padding:'20px', borderRadius:'12px', border:`1px solid ${brd}`, background:bg, color:col, fontFamily:"'Bebas Neue',sans-serif", fontSize:'2rem', cursor:'pointer', transition:'all 0.15s' }}>
              {ch}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const TABS = [
  { id:'alphabet', label:'Alphabet', icon:BookOpen },
  { id:'numbers',  label:'Numbers',  icon:Layers },
  { id:'phrases',  label:'Phrases',  icon:BookOpen },
  { id:'quiz',     label:'Quiz',     icon:Trophy },
];

export default function Learn() {
  const [tab, setTab] = useState('alphabet');
  const [selected, setSel] = useState(null);
  const letters = Object.keys(ALPHABET);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:'32px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
          <div style={{ width:'24px', height:'1px', background:'#06b6d4' }} />
          <span style={{ fontSize:'0.7rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#06b6d4' }}>Visual Dictionary</span>
        </div>
        <h1 className="display" style={{ fontSize:'clamp(2.5rem,6vw,4rem)' }}>LEARN ASL</h1>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.9rem', marginTop:'6px', fontFamily:"'Space Grotesk',sans-serif" }}>Click any sign card to expand the detail view.</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'4px', width:'fit-content', marginBottom:'28px' }}>
        {TABS.map(({ id, label, icon:Icon }) => (
          <button key={id} onClick={()=>setTab(id)} style={{
            display:'flex', alignItems:'center', gap:'6px',
            padding:'8px 16px', borderRadius:'8px', border:'none', cursor:'pointer',
            background: tab===id ? 'rgba(124,58,237,0.35)' : 'transparent',
            color: tab===id ? '#fff' : 'rgba(255,255,255,0.45)',
            fontSize:'0.82rem', fontWeight:500, transition:'all 0.15s',
            boxShadow: tab===id ? '0 0 12px rgba(124,58,237,0.3)' : 'none',
          }}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {tab==='alphabet' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(90px,1fr))', gap:'10px', marginBottom:'16px' }}>
            {letters.map(l => <LetterCard key={l} letter={l} data={ALPHABET[l]} onClick={setSel} />)}
          </div>
          <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.2)', textAlign:'center' }}>
            Images via <a href="https://www.lifeprint.com" target="_blank" rel="noopener noreferrer" style={{ color:'rgba(255,255,255,0.35)', textDecoration:'underline' }}>Lifeprint.com</a> — a free ASL educational resource.
          </p>
        </>
      )}

      {tab==='numbers' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:'12px' }}>
          {Object.entries(NUMBERS).map(([num, data]) => (
            <div key={num} style={{ ...glass, padding:'16px', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
              <SignImage letter={num} size="md" />
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem' }}>{num}</span>
              <p style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.45)', textAlign:'center', lineHeight:1.5 }}>{data.desc}</p>
            </div>
          ))}
        </div>
      )}

      {tab==='phrases' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'12px' }}>
          {PHRASES.map(({ sign, desc, category }) => (
            <div key={sign} style={{ ...glass, padding:'18px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.3rem', letterSpacing:'0.04em' }}>{sign}</span>
                <span style={{ fontSize:'0.65rem', padding:'3px 10px', borderRadius:'9999px', background:'rgba(6,182,212,0.12)', color:'#67e8f9', border:'1px solid rgba(6,182,212,0.2)' }}>{category}</span>
              </div>
              <p style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      )}

      {tab==='quiz' && <Quiz />}

      {selected && (
        <DetailModal letter={selected} data={ALPHABET[selected]}
          onClose={()=>setSel(null)}
          onPrev={()=>setSel(letters[letters.indexOf(selected)-1])}
          onNext={()=>setSel(letters[letters.indexOf(selected)+1])} />
      )}
    </div>
  );
}
