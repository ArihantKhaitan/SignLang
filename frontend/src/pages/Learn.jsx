import { useState, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCcw, Trophy, Lightbulb, Search } from 'lucide-react';
import { LANGUAGES, supportedSymbols } from '../lib/classifier';
import { signImage, phraseImage } from '../lib/signRefs';

const ALL_LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];

const ASL_ALPHABET = {
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

const ASL_NUMBERS = {
  '1':'Index finger points straight up, all others closed.',
  '2':'Index and middle fingers point up in a V.',
  '3':'Index, middle, and thumb extended.',
  '4':'Four fingers straight up, thumb folded.',
  '5':'All five fingers spread open wide.',
  '6':'Pinky and thumb touch, other three fingers point up.',
  '7':'Ring finger and thumb touch, other fingers point up.',
  '8':'Middle finger and thumb touch, other fingers point up.',
  '9':'Index and thumb form a small circle, others point up.',
  '10':'Thumb up, shake wrist side to side.',
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

const MOTION_NOTES = {
  bsl: 'H, J and Y involve motion in BSL, so there is no static reference for them yet.',
  isl: 'H, J and V are not in the ISL training data yet.',
};

/* ── Sign image with fallback ───────────────────────────────────────── */
function SignImg({ lang, symbol, size = 80 }) {
  const [err, setErr] = useState(false);
  useEffect(() => setErr(false), [lang, symbol]);
  if (err) return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-soft)', borderRadius: 8 }}>
      <span style={{ fontSize: size * 0.4, fontWeight: 700, color: 'var(--accent)' }}>{symbol}</span>
    </div>
  );
  return <img src={signImage(lang, symbol)} alt={`${LANGUAGES[lang].name} sign ${symbol}`} width={size} height={size}
    style={{ width: size, height: size, objectFit: 'contain', borderRadius: 8, background: '#fff', display: 'block' }}
    loading="lazy" onError={() => setErr(true)} />;
}

/* ── Alphabet card ─────────────────────────────────────────────────── */
function LetterCard({ lang, letter, supported, onClick }) {
  return (
    <button onClick={() => supported && onClick(letter)} className="card"
      disabled={!supported}
      title={supported ? letter : `${letter} — motion sign, not available in ${LANGUAGES[lang].name} yet`}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        padding: 14, cursor: supported ? 'pointer' : 'default',
        opacity: supported ? 1 : 0.35,
        transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={e => { if (supported) e.currentTarget.style.borderColor = 'var(--border-hov)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      {supported ? <SignImg lang={lang} symbol={letter} size={64} /> : (
        <div style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: 'var(--accent-soft)' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.3 }}>motion<br />sign</span>
        </div>
      )}
      <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{letter}</span>
    </button>
  );
}

/* ── Detail modal ──────────────────────────────────────────────────── */
function DetailModal({ lang, letter, letters, onClose, onPrev, onNext }) {
  const idx = letters.indexOf(letter);
  const data = lang === 'asl' ? ASL_ALPHABET[letter] : null;
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowLeft' && idx > 0) onPrev(); if (e.key === 'ArrowRight' && idx < letters.length - 1) onNext(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [idx]);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.65)', padding: 24,
      animation: 'fadeIn 0.15s ease',
    }}>
      <div onClick={e => e.stopPropagation()} className="card" style={{
        width: '100%', maxWidth: 420, padding: 28, position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
      }}>
        <button onClick={onClose} aria-label="Close" style={{
          position: 'absolute', top: 14, right: 14,
          background: 'transparent', border: 'none', borderRadius: 8,
          width: 36, height: 36, cursor: 'pointer', color: 'var(--text-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>{letter}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: 6 }}>
              {LANGUAGES[lang].name} · {idx + 1} of {letters.length}
            </div>
          </div>
          <SignImg lang={lang} symbol={letter} size={110} />
        </div>

        {data ? (
          <>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 14 }}>
              {data.desc}
            </p>
            {data.tips && (
              <div style={{
                display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 8,
                background: 'var(--accent-soft)', marginBottom: 12,
              }}>
                <Lightbulb size={15} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.55 }}>{data.tips}</span>
              </div>
            )}
            {data.similar?.length > 0 && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: 16 }}>
                Often confused with <strong style={{ color: 'var(--text-2)' }}>{data.similar.join(', ')}</strong>
              </p>
            )}
          </>
        ) : (
          <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 16 }}>
            {lang === 'bsl'
              ? 'Fingerspelling in BSL is mostly two-handed. The diagram shows the hand positions from the training data.'
              : 'Fingerspelling in ISL is mostly two-handed. The photo comes from the training dataset.'}
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={onPrev} disabled={idx === 0} className="btn btn-secondary"
            style={{ flex: 1, fontSize: '0.82rem', opacity: idx === 0 ? 0.45 : 1 }}>
            <ChevronLeft size={14} /> Prev
          </button>
          <button onClick={onNext} disabled={idx === letters.length - 1} className="btn btn-secondary"
            style={{ flex: 1, fontSize: '0.82rem', opacity: idx === letters.length - 1 ? 0.45 : 1 }}>
            Next <ChevronRight size={14} />
          </button>
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

function Quiz({ lang, letters }) {
  const [qs, setQs] = useState(() => Array.from({ length: 10 }, () => makeQ(letters)));
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {          // new deck when language changes
    setQs(Array.from({ length: 10 }, () => makeQ(letters)));
    setQi(0); setSel(null); setScore(0); setDone(false);
  }, [lang]);

  const answer = useCallback(ch => {
    if (sel) return;
    setSel(ch);
    if (ch === qs[qi].correct) setScore(s => s + 1);
    setTimeout(() => {
      if (qi + 1 >= 10) setDone(true);
      else { setQi(i => i + 1); setSel(null); }
    }, 800);
  }, [sel, qi, qs]);

  const restart = () => {
    setQs(Array.from({ length: 10 }, () => makeQ(letters)));
    setQi(0); setSel(null); setScore(0); setDone(false);
  };

  if (done) return (
    <div style={{ maxWidth: 360, margin: '0 auto', textAlign: 'center', padding: '48px 0' }}>
      <Trophy size={44} style={{ margin: '0 auto 16px', color: score >= 7 ? 'var(--accent)' : 'var(--text-3)' }} />
      <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>
        {score}<span style={{ fontSize: '1.4rem', color: 'var(--text-3)', fontWeight: 500 }}>/10</span>
      </div>
      <p style={{ color: 'var(--text-2)', margin: '12px 0 24px', fontSize: '0.92rem' }}>
        {score === 10 ? `Perfect — you know your ${LANGUAGES[lang].name} alphabet.` : score >= 7 ? 'Great job. A bit more practice and you\'ve got it.' : 'Keep studying — you\'ll get there.'}
      </p>
      <button onClick={restart} className="btn btn-primary">
        <RotateCcw size={14} /> Try again
      </button>
    </div>
  );

  const q = qs[qi];
  return (
    <div style={{ maxWidth: 360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>
          <span>Question {qi + 1} of 10</span><span>Score {score}</span>
        </div>
        <div style={{ height: 4, background: 'var(--border)', borderRadius: 9999, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--accent)', width: `${qi * 10}%`, transition: 'width 0.3s' }} />
        </div>
      </div>

      <div className="card" style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
        <img src={signImage(lang, q.correct)} alt="Which letter is this?" width={150} height={150}
          style={{ width: 150, height: 150, objectFit: 'contain', background: '#fff', borderRadius: 8 }}
          onError={e => { e.target.style.display = 'none'; }} />
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-2)' }}>Which letter is this?</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {q.choices.map(ch => {
          let bg = 'var(--surface)', col = 'var(--text)', brd = 'var(--border)';
          if (sel) {
            if (ch === q.correct) { bg = 'var(--success-soft)'; col = 'var(--success)'; brd = 'var(--success)'; }
            else if (ch === sel) { bg = 'var(--danger-soft)'; col = 'var(--danger)'; brd = 'var(--danger)'; }
            else { col = 'var(--text-3)'; }
          }
          return (
            <button key={ch} onClick={() => answer(ch)} style={{
              padding: '16px', borderRadius: 'var(--radius-sm)',
              border: `1px solid ${brd}`, background: bg, color: col,
              fontSize: '1.5rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}>
              {ch}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Pills ──────────────────────────────────────────────────────────── */
function Pills({ options, value, onChange }) {
  return (
    <div style={{
      display: 'inline-flex', gap: 2, padding: 3,
      background: '#101114', border: '1px solid var(--border)', borderRadius: 10,
    }}>
      {options.map(([id, lbl]) => {
        const active = value === id;
        return (
          <button key={id} onClick={() => onChange(id)} style={{
            minHeight: 38, padding: '0 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: active ? 600 : 400,
            background: active ? 'var(--surface-grad)' : 'transparent',
            color: active ? 'var(--text)' : 'var(--text-2)',
            boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 3px rgba(0,0,0,0.4)' : 'none',
            transition: 'all 0.15s ease',
          }}>{lbl}</button>
        );
      })}
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function Learn() {
  const [tab, setTab] = useState('alphabet');
  const [lang, setLang] = useState('asl');
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState('');

  const symbols = supportedSymbols(lang);
  const supportedLetters = ALL_LETTERS.filter(l => symbols.has(l));
  const numbers = [...symbols].filter(s => !/[A-Z]/.test(s)).sort((a, b) => Number(a) - Number(b));
  const filtered = search ? ALL_LETTERS.filter(l => l.toLowerCase().includes(search.toLowerCase())) : ALL_LETTERS;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>Learn</h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-2)' }}>
          Reference for fingerspelling in three sign languages, plus common ASL phrases.
        </p>
      </div>

      {/* Tabs + language + search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <Pills value={tab} onChange={setTab}
          options={[['alphabet', 'Alphabet'], ['numbers', 'Numbers'], ['phrases', 'Phrases'], ['quiz', 'Quiz']]} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {tab !== 'phrases' && (
            <Pills value={lang} onChange={l => { setLang(l); setSel(null); }}
              options={Object.values(LANGUAGES).map(l => [l.key, l.name])} />
          )}
          {tab === 'alphabet' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '0 12px', minHeight: 42,
            }}>
              <Search size={14} style={{ color: 'var(--text-3)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search letter"
                aria-label="Search letter"
                style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '0.88rem', width: 100 }} />
            </div>
          )}
        </div>
      </div>

      {/* Alphabet */}
      {tab === 'alphabet' && (
        <>
          <div className="alpha-grid">
            {filtered.map(l => (
              <LetterCard key={l} lang={lang} letter={l} supported={symbols.has(l)} onClick={setSel} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-3)', marginTop: 40, fontSize: '0.9rem' }}>
              No results for “{search}”
            </p>
          )}
          <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', textAlign: 'center', marginTop: 24 }}>
            {lang === 'asl' && <>Images from <a href="https://www.lifeprint.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-2)' }}>Lifeprint.com</a>, a free ASL educational resource.</>}
            {lang !== 'asl' && MOTION_NOTES[lang]}
          </p>
        </>
      )}

      {/* Numbers */}
      {tab === 'numbers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
          {(lang === 'asl' ? Object.keys(ASL_NUMBERS) : numbers).map(num => (
            <div key={num} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <SignImg lang={lang} symbol={num} size={72} />
              <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{num}</span>
              {lang === 'asl' && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-2)', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>{ASL_NUMBERS[num]}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Phrases (ASL) */}
      {tab === 'phrases' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
            {PHRASES.map(({ sign, desc, cat }) => {
              const gif = phraseImage(sign);
              return (
                <div key={sign} className="card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '1rem', fontWeight: 600 }}>{sign}</span>
                    <span style={{
                      fontSize: '0.72rem', padding: '3px 10px', borderRadius: 9999,
                      background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 500,
                    }}>{cat}</span>
                  </div>
                  {gif && (
                    <img src={gif} alt={`ASL sign ${sign}`} loading="lazy"
                      style={{ width: '100%', height: 170, objectFit: 'contain', background: '#fff', borderRadius: 8, marginBottom: 10 }}
                      onError={e => { e.target.style.display = 'none'; }} />
                  )}
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', textAlign: 'center', marginTop: 24 }}>
            ASL phrases · animations from <a href="https://www.lifeprint.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-2)' }}>Lifeprint.com</a>
          </p>
        </>
      )}

      {/* Quiz */}
      {tab === 'quiz' && <Quiz lang={lang} letters={supportedLetters} />}

      {/* Detail modal */}
      {sel && (
        <DetailModal lang={lang} letter={sel} letters={supportedLetters}
          onClose={() => setSel(null)}
          onPrev={() => setSel(supportedLetters[supportedLetters.indexOf(sel) - 1])}
          onNext={() => setSel(supportedLetters[supportedLetters.indexOf(sel) + 1])} />
      )}
    </div>
  );
}
