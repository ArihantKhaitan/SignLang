import StarField from './StarField';

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">

      {/* Stars */}
      <div className="absolute inset-0">
        <StarField className="w-full h-full" />
      </div>

      {/* Violet nebula — top centre */}
      <div style={{
        position: 'absolute', top: '-10%', left: '50%',
        transform: 'translateX(-50%)',
        width: '80vw', height: '60vh',
        background: 'radial-gradient(ellipse at 50% 30%, rgba(124,58,237,0.28) 0%, rgba(124,58,237,0.08) 45%, transparent 70%)',
        filter: 'blur(2px)',
        animation: 'nebulaPulse 6s ease-in-out infinite',
      }} />

      {/* Cyan accent — bottom right */}
      <div style={{
        position: 'absolute', bottom: '0', right: '0',
        width: '50vw', height: '50vh',
        background: 'radial-gradient(ellipse at 80% 80%, rgba(6,182,212,0.12) 0%, transparent 65%)',
      }} />

      {/* White light beam */}
      <div style={{
        position: 'absolute', top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '2px', height: '55%',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.5) 70%, rgba(255,255,255,0) 100%)',
        animation: 'beamPulse 3s ease-in-out infinite',
      }} />

      {/* Beam halo */}
      <div style={{
        position: 'absolute', top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '180px', height: '55%',
        background: 'linear-gradient(to bottom, rgba(180,160,255,0) 0%, rgba(180,160,255,0.06) 50%, transparent 100%)',
      }} />

      {/* Mountain layer 4 — far, darkest */}
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none"
        style={{ position:'absolute', bottom:0, left:0, width:'100%', height:'220px' }}>
        <path d="M0,200 L0,140 L80,90 L180,130 L280,60 L400,110 L520,50 L640,100 L760,40 L900,95 L1020,55 L1140,100 L1260,70 L1360,115 L1440,80 L1440,200 Z"
          fill="rgba(3,2,20,0.85)" />
      </svg>

      {/* Mountain layer 3 */}
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none"
        style={{ position:'absolute', bottom:0, left:0, width:'100%', height:'170px' }}>
        <path d="M0,200 L0,160 L100,110 L220,145 L340,85 L460,130 L580,75 L700,120 L820,65 L940,110 L1060,80 L1180,125 L1300,90 L1440,130 L1440,200 Z"
          fill="rgba(4,2,22,0.9)" />
      </svg>

      {/* Mountain layer 2 */}
      <svg viewBox="0 0 1440 180" preserveAspectRatio="none"
        style={{ position:'absolute', bottom:0, left:0, width:'100%', height:'130px' }}>
        <path d="M0,180 L0,150 L120,100 L240,135 L360,90 L480,130 L620,70 L740,115 L860,80 L1000,120 L1120,85 L1260,130 L1380,95 L1440,120 L1440,180 Z"
          fill="rgba(5,2,32,0.95)" />
      </svg>

      {/* Mountain layer 1 — closest, almost void */}
      <svg viewBox="0 0 1440 140" preserveAspectRatio="none"
        style={{ position:'absolute', bottom:0, left:0, width:'100%', height:'90px' }}>
        <path d="M0,140 L0,110 L160,60 L320,100 L480,55 L640,95 L800,50 L960,90 L1120,55 L1280,90 L1440,70 L1440,140 Z"
          fill="#000308" />
      </svg>

    </div>
  );
}
