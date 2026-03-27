import { useState, useCallback, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCcw, Trophy, Lightbulb, Search } from 'lucide-react';

const IMG = l => `https://www.lifeprint.com/asl101/gifs-animated/${l.toLowerCase()}.gif`;

const ALPHABET = {
  A:{desc:'Closed fist, thumb rests against the side.',tips:'Thumb to the side, not on top',similar:['S','E']},
  B:{desc:'Four fingers straight up and together, thumb folded flat across the palm.',tips:'Fingers flat and pressed together',similar:[]},
  C:{desc:'Curve all fingers and thumb to form a C shape.',tips:'Rounded like the letter C',similar:['O']},
  D:{desc:'Index finger points up, others and thumb form a circle.',tips:'Only index points up',similar:[]},
  E:{desc:'All four fingers bend down so fingertips rest on the top of the thumb.',tips:'All fingertips touch the thumb',similar:['A','S']},
  F:{desc:'Index and thumb touch to form a small O, other three fingers point straight up.',tips:'Three fingers spread upward',similar:[]},
  G:{desc:'Index finger and thumb both point sideways, other fingers closed.',tips:'Like pointing a gun sideways',similar:['H','Q']},
  H:{desc:'Index and middle fingers extend horizontally together, pointing to the side.',tips:'Two fingers side by side sideways',similar:['G','U']},
  I:{desc:'Pinky finger extends straight up, all other fingers curled into a fist.',tips:'Only the pinky stands up',similar:['J','Y']},
  J:{desc:'Start with I (pinky up), then trace a J shape in the air.',tips:'Motion sign — trace a J downward then hook',similar:['I']},
  K:{desc:'Index and middle fingers point up in a V, thumb between them.',tips:'Thumb between index and middle',similar:['P','V']},
  L:{desc:'Index finger points up, thumb extends sideways. Forms an L shape.',tips:'Clean right angle between index and thumb',similar:[]},
  M:{desc:'Three fingers fold over and rest in front of the thumb.',tips:'Three humps = M',similar:['N']},
  N:{desc:'Index and middle fingers fold over and rest in front of the thumb.',tips:'Two humps = N',similar:['M']},
  O:{desc:'All fingers and thumb curve to touch at their tips, forming a full O.',tips:'All fingertips touch the thumb tip',similar:['C']},
  P:{desc:'Like K but the whole hand rotates so fingers point downward.',tips:'K shape pointing down',similar:['K']},
  Q:{desc:'Index finger and thumb both point downward, like G facing down.',tips:'G shape pointing down',similar:['G']},
  R:{desc:'Index and middle fingers cross over each other, both pointing up.',tips:'Cross your index and middle fingers',similar:[]},
  S:{desc:'Closed fist with thumb wrapped across the front of all four curled fingers.',tips:'Thumb crosses in front, unlike A',similar:['A','E']},
  T:{desc:'Thumb is tucked between the index and middle finger.',tips:'Thumb peeks between index and middle',similar:[]},
  U:{desc:'Index and middle fingers extend straight up together.',tips:'Two fingers together pointing up',similar:['H','V']},
  V:{desc:'Index and middle fingers spread open in a V (peace sign).',tips:'Classic peace / victory sign',similar:['U','K']},
  W:{desc:'Index, middle, and ring fingers spread open upward, pinky and thumb touch.',tips:'Three fingers up and spread',similar:[]},
  X:{desc:'Index finger hooks or bends like a fishhook, all other fingers closed.',tips:'Just the index finger bent',similar:[]},
  Y:{desc:'Thumb and pinky extend outward, index, middle, ring fingers closed.',tips:'Shaka / hang-loose sign',similar:['I']},
  Z:{desc:'Index finger traces a Z shape in the air.',tips:'Motion sign — draw a Z',similar:[]},
};

const NUMBERS = {
  '1':{desc:'Index finger points straight up, all others closed.',tips:'Classic one'},
  '2':{desc:'Index and middle fingers point up in a V.',tips:'Like V / peace'},
  '3':{desc:'Index, middle, and thumb extended.',tips:'Three fingers out'},
  '4':{desc:'Four fingers straight up, thumb folded.',tips:'Like B but four fingers'},
  '5':{desc:'All five fingers spread open wide.',tips:'Open hand, spread'},
  '6':{desc:'Pinky and thumb touch, other three fingers point up.',tips:'Pinky + thumb'},
  '7':{desc:'Ring finger and thumb touch, other fingers point up.',tips:'Ring + thumb'},
  '8':{desc:'Middle finger and thumb touch, other fingers point up.',tips:'Middle + thumb'},
  '9':{desc:'Index and thumb form a small circle, others point up.',tips:'Like F'},
  '10':{desc:'Thumb up, shake wrist side to side.',tips:'Fist with thumb up, wag it'},
};

const PHRASES = [
  {sign:'Hello',desc:'Open hand, palm forward, move away from forehead like a salute.',cat:'Greetings'},
  {sign:'Thank You',desc:'Flat hand at chin, fingers touching lips, moves forward and down.',cat:'Greetings'},
  {sign:'Please',desc:'Flat hand on chest, rub in a circular motion.',cat:'Polite'},
  {sign:'Sorry',desc:'Fist on chest, move in a circular motion.',cat:'Polite'},
  {sign:'Yes',desc:'Fist nods up and down like a head nodding yes.',cat:'Responses'},
  {sign:'No',desc:'Index and middle fingers quickly close to thumb twice.',cat:'Responses'},
  {sign:'Help',desc:'Thumb up (A hand) on flat palm, move both hands upward.',cat:'Essential'},
  {sign:'Stop',desc:'Flat hand chops down onto the palm of the other flat hand.',cat:'Essential'},
  {sign:'Good',desc:'Flat hand starts at mouth, moves outward and downward.',cat:'Emotions'},
  {sign:'Love',desc:'Cross arms over chest like a hug.',cat:'Emotions'},
  {sign:'Water',desc:'W hand (3 fingers up) taps chin twice.',cat:'Everyday'},
  {sign:'Where',desc:'Index finger points and waves side to side.',cat:'Questions'},
];

/* ── Sign image with fallback letter ───────────────────────────────── */
function SignImg({ letter, size = 80 }) {
  const [err, setErr] = useState(false);
  if (err) return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(124,58,237,0.1)', borderRadius: 12 }}>
      <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: size * 0.55, color: '#a78bfa' }}>{letter}</span>
    </div>
  );
  return <img src={IMG(letter)} alt={`ASL ${letter}`} style={{ width: size, height: size, objectFit: 'contain', borderRadius: 12, background: '#fff', display: 'block' }} onError={() => setErr(true)} />;
}

/* ── Alphabet card ─────────────────────────────────────────────────── */
function LetterCard({ letter, data, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={() => onClick(letter)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        padding: 16, borderRadius: 18, cursor: 'pointer',
        background: hov ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid ${hov ? 'rgba(124,58,237,0.35)' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: hov
          ? 'inset 0 1px 0 rgba(255,255,255,0.12), 0 12px 36px rgba(124,58,237,0.18)'
          : 'inset 0 1px 0 rgba(255,255,255,0.05)',
        transform: hov ? 'translateY(-3px)' : 'none',
        transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}>
      <SignImg letter={letter} size={72} />
      <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.5rem', lineHeight: 1, color: hov ? '#c4b5fd' : '#fff' }}>{letter}</span>
      {data.similar?.length > 0 && <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.22)' }}>≈ {data.similar.join(' ')}</span>}
    </button>
  );
}

/* ── Detail modal ──────────────────────────────────────────────────── */
function DetailModal({ letter, data, onClose, onPrev, onNext }) {
  const letters = Object.keys(ALPHABET);
  const idx = letters.indexOf(letter);
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowLeft' && idx > 0) onPrev(); if (e.key === 'ArrowRight' && idx < letters.length - 1) onNext(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [idx]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(8,4,30,0.92)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 40px 100px rgba(0,0,0,0.85)',
        borderRadius: 26, padding: 32, position: 'relative',
      }}>
        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={14} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '4.5rem', lineHeight: 1, filter: 'drop-shadow(0 0 20px rgba(124,58,237,0.5))' }}>{letter}</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: 4, letterSpacing: '0.1em' }}>
              {idx + 1} of {letters.length}
            </div>
          </div>
          <SignImg letter={letter} size={120} />
        </div>

        {/* Description */}
        <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 16 }}>
          {data.desc}
        </p>

        {/* Tip */}
        {data.tips && (
          <div style={{ display: 'flex', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', marginBottom: 12 }}>
            <Lightbulb size={15} style={{ color: '#a78bfa', flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: '0.84rem', color: '#c4b5fd', lineHeight: 1.6 }}>{data.tips}</span>
          </div>
        )}
        {data.similar?.length > 0 && (
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>Often confused with: <strong style={{ color: 'rgba(255,255,255,0.5)' }}>{data.similar.join(', ')}</strong></p>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {[
            { label: <><ChevronLeft size={14} /> Prev</>, fn: onPrev, dis: idx === 0 },
            { label: 'Close', fn: onClose, dis: false },
            { label: <>Next <ChevronRight size={14} /></>, fn: onNext, dis: idx === letters.length - 1 },
          ].map(({ label, fn, dis }, i) => (
            <button key={i} onClick={fn} disabled={dis} style={{
              flex: 1, padding: '10px 8px', borderRadius: 10, border: 'none', cursor: dis ? 'default' : 'pointer',
              background: 'rgba(255,255,255,0.06)', color: dis ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
              fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => { if (!dis) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            >{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Quiz ──────────────────────────────────────────────────────────── */
function shuffle(a) { return [...a].sort(() => Math.random() - 0.5); }
function makeQ(letters) {
  const correct = letters[Math.floor(Math.random() * letters.length)];
  const choices = shuffle([correct, ...shuffle(letters.filter(l => l !== correct)).slice(0, 3)]);
  return { correct, choices };
}

function Quiz() {
  const letters = Object.keys(ALPHABET);
  const [qs] = useState(() => Array.from({ length: 10 }, () => makeQ(letters)));
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const answer = useCallback(ch => {
    if (sel) return;
    setSel(ch);
    if (ch === qs[qi].correct) setScore(s => s + 1);
    setTimeout(() => {
      if (qi + 1 >= 10) setDone(true);
      else { setQi(i => i + 1); setSel(null); }
    }, 800);
  }, [sel, qi, qs]);

  if (done) return (
    <div style={{ maxWidth: 380, margin: '0 auto', textAlign: 'center', padding: '60px 0' }}>
      <Trophy size={56} style={{ margin: '0 auto 20px', color: score >= 7 ? '#fbbf24' : 'rgba(255,255,255,0.2)' }} />
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '5rem', lineHeight: 1 }}>{score}<span style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.3)' }}>/10</span></div>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Space Grotesk',sans-serif", marginBottom: 28 }}>
        {score === 10 ? 'Perfect! You know your ASL alphabet!' : score >= 7 ? 'Great job! A bit more practice and you\'ve got it.' : 'Keep studying — you\'ll nail it!'}
      </p>
      <button onClick={() => { setQi(0); setSel(null); setScore(0); setDone(false); }} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 9999, cursor: 'pointer', border: 'none',
        background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.45)', color: '#c4b5fd', fontSize: '0.85rem',
      }}>
        <RotateCcw size={14} /> Try Again
      </button>
    </div>
  );

  const q = qs[qi];
  return (
    <div style={{ maxWidth: 380, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginBottom: 6, fontFamily: "'Space Grotesk',sans-serif" }}>
          <span>Question {qi + 1} / 10</span><span>Score: {score}</span>
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 9999, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#7c3aed,#06b6d4)', width: `${qi * 10}%`, transition: 'width 0.4s' }} />
        </div>
      </div>
      {/* Image */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: '0 0 40px rgba(124,58,237,0.3)' }}>
          <img src={IMG(q.correct)} alt="?" style={{ width: 160, height: 160, objectFit: 'contain', display: 'block' }} onError={e => { e.target.style.display = 'none'; }} />
        </div>
      </div>
      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Grotesk',sans-serif" }}>Which letter is this?</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {q.choices.map(ch => {
          let bg = 'rgba(255,255,255,0.05)', col = '#fff', brd = 'rgba(255,255,255,0.1)';
          if (sel) {
            if (ch === q.correct) { bg = 'rgba(52,211,153,0.2)'; col = '#34d399'; brd = 'rgba(52,211,153,0.5)'; }
            else if (ch === sel) { bg = 'rgba(248,113,113,0.2)'; col = '#f87171'; brd = 'rgba(248,113,113,0.5)'; }
            else { bg = 'rgba(255,255,255,0.02)'; col = 'rgba(255,255,255,0.2)'; }
          }
          return (
            <button key={ch} onClick={() => answer(ch)} style={{ padding: '18px', borderRadius: 12, border: `1px solid ${brd}`, background: bg, color: col, fontFamily: "'Bebas Neue',sans-serif", fontSize: '2.2rem', cursor: 'pointer', transition: 'all 0.15s' }}>
              {ch}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Tab button ─────────────────────────────────────────────────────── */
function Tab({ id, label, active, onClick }) {
  return (
    <button onClick={() => onClick(id)} style={{
      padding: '9px 22px', borderRadius: 10, border: 'none', cursor: 'pointer',
      fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, fontSize: '0.82rem',
      background: active ? 'rgba(124,58,237,0.3)' : 'transparent',
      color: active ? '#fff' : 'rgba(255,255,255,0.45)',
      border: `1px solid ${active ? 'rgba(124,58,237,0.5)' : 'transparent'}`,
      boxShadow: active ? '0 0 16px rgba(124,58,237,0.25)' : 'none',
      transition: 'all 0.2s',
    }}>{label}</button>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function Learn() {
  const [tab, setTab] = useState('alphabet');
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState('');
  const letters = Object.keys(ALPHABET);
  const filtered = search ? letters.filter(l => l.toLowerCase().includes(search.toLowerCase())) : letters;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <span style={{ fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(6,182,212,0.8)', display: 'block', marginBottom: 6 }}>Visual Dictionary</span>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2.5rem,6vw,4rem)', margin: 0, lineHeight: 1 }}>
          LEARN ASL
        </h1>
        <p style={{ fontFamily: "'Space Grotesk',sans-serif", color: 'rgba(255,255,255,0.35)', fontSize: '0.88rem', marginTop: 8 }}>
          Animated reference for every letter, number, and phrase. Click any card to explore.
        </p>
      </div>

      {/* Tabs + search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)', borderRadius: 14, padding: 4 }}>
          {[['alphabet','Alphabet'],['numbers','Numbers'],['phrases','Phrases'],['quiz','Quiz']].map(([id, lbl]) => (
            <Tab key={id} id={id} label={lbl} active={tab === id} onClick={setTab} />
          ))}
        </div>
        {tab === 'alphabet' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 14px' }}>
            <Search size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search letter…"
              style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '0.82rem', width: 120, fontFamily: "'Space Grotesk',sans-serif" }} />
          </div>
        )}
      </div>

      {/* ── Alphabet ── */}
      {tab === 'alphabet' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(100px,1fr))', gap: 10 }}>
            {filtered.map(l => <LetterCard key={l} letter={l} data={ALPHABET[l]} onClick={setSel} />)}
          </div>
          {filtered.length === 0 && <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', marginTop: 40 }}>No results for "{search}"</p>}
          <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 20 }}>
            Images from <a href="https://www.lifeprint.com" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.35)' }}>Lifeprint.com</a> — free ASL educational resource
          </p>
        </>
      )}

      {/* ── Numbers ── */}
      {tab === 'numbers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 12 }}>
          {Object.entries(NUMBERS).map(([num, data]) => (
            <div key={num} style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.3)', borderRadius: 18, padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <SignImg letter={num} size={80} />
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2rem' }}>{num}</span>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 1.5, fontFamily: "'Space Grotesk',sans-serif", margin: 0 }}>{data.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Phrases ── */}
      {tab === 'phrases' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
          {PHRASES.map(({ sign, desc, cat }) => (
            <div key={sign} style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.3)', borderRadius: 18, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.4rem', letterSpacing: '0.04em' }}>{sign}</span>
                <span style={{ fontSize: '0.62rem', padding: '3px 10px', borderRadius: 9999, background: 'rgba(6,182,212,0.1)', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.2)' }}>{cat}</span>
              </div>
              <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '0.84rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Quiz ── */}
      {tab === 'quiz' && <Quiz />}

      {/* Detail modal */}
      {sel && (
        <DetailModal letter={sel} data={ALPHABET[sel]}
          onClose={() => setSel(null)}
          onPrev={() => setSel(letters[letters.indexOf(sel) - 1])}
          onNext={() => setSel(letters[letters.indexOf(sel) + 1])} />
      )}
    </div>
  );
}
