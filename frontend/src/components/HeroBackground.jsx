import StarField from './StarField';

/**
 * Full-page fixed background — always visible behind all content.
 * Horizon aesthetic: starfield + nebula + light beam + 4-layer mountains.
 */
export default function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Stars */}
      <StarField className="absolute inset-0 w-full h-full" />

      {/* Violet nebula — top centre bloom */}
      <div style={{
        position: 'absolute', top: '-5%', left: '50%',
        transform: 'translateX(-50%)',
        width: '90vw', height: '70vh',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(60,20,180,0.35) 0%, rgba(80,30,200,0.12) 40%, transparent 70%)',
        animation: 'nebulaPulse 7s ease-in-out infinite',
      }} />

      {/* Cyan accent — bottom right */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: '55vw', height: '55vh',
        background: 'radial-gradient(ellipse at 85% 90%, rgba(6,182,212,0.1) 0%, transparent 65%)',
      }} />

      {/* White light beam */}
      <div style={{
        position: 'absolute', top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '2px', height: '65%',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 35%, rgba(255,255,255,0.6) 65%, rgba(255,255,255,0) 100%)',
        animation: 'beamPulse 3.5s ease-in-out infinite',
      }} />
      {/* Beam halo */}
      <div style={{
        position: 'absolute', top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '220px', height: '65%',
        background: 'linear-gradient(to bottom, transparent 0%, rgba(160,120,255,0.07) 40%, transparent 100%)',
      }} />

      {/* Mountain layer 4 — far, blue-dark */}
      <svg viewBox="0 0 1440 220" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '240px' }}>
        <path
          d="M0,220 L0,150 L70,95 L160,138 L260,65 L380,118 L500,52 L620,105 L740,38 L880,100 L1000,58 L1120,108 L1240,72 L1360,118 L1440,82 L1440,220 Z"
          fill="rgba(8,6,40,0.82)" />
      </svg>

      {/* Mountain layer 3 */}
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '185px' }}>
        <path
          d="M0,200 L0,160 L90,112 L200,148 L320,88 L440,135 L570,78 L700,125 L820,68 L950,118 L1070,82 L1190,130 L1320,92 L1440,135 L1440,200 Z"
          fill="rgba(5,3,28,0.88)" />
      </svg>

      {/* Mountain layer 2 */}
      <svg viewBox="0 0 1440 170" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '145px' }}>
        <path
          d="M0,170 L0,140 L110,95 L230,128 L360,85 L490,125 L630,68 L760,112 L880,78 L1010,118 L1140,82 L1280,128 L1400,90 L1440,115 L1440,170 Z"
          fill="rgba(3,2,18,0.93)" />
      </svg>

      {/* Mountain layer 1 — foreground, pure void */}
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '90px' }}>
        <path
          d="M0,120 L0,95 L140,55 L290,90 L450,48 L610,88 L770,42 L940,85 L1100,50 L1270,88 L1440,62 L1440,120 Z"
          fill="#000308" />
      </svg>
    </div>
  );
}
