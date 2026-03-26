import { useEffect, useRef } from 'react';

const STAR_COUNT = 1800;

function rand(min, max) { return Math.random() * (max - min) + min; }

function makeStars(w, h) {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: rand(0, w),
    y: rand(0, h),
    r: rand(0.3, 1.6),
    speed: rand(0.01, 0.06),
    alpha: rand(0.3, 1),
    dAlpha: rand(0.002, 0.008) * (Math.random() < 0.5 ? 1 : -1),
    hue: Math.random() < 0.15 ? 200 : Math.random() < 0.1 ? 270 : 0,   // blue / violet tints
  }));
}

export default function StarField({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      stars = makeStars(canvas.width, canvas.height);
    };

    let stars = [];
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach(s => {
        s.alpha += s.dAlpha;
        if (s.alpha >= 1)   { s.alpha = 1;   s.dAlpha = -Math.abs(s.dAlpha); }
        if (s.alpha <= 0.1) { s.alpha = 0.1; s.dAlpha =  Math.abs(s.dAlpha); }
        s.y -= s.speed;
        if (s.y < 0) { s.y = canvas.height; s.x = rand(0, canvas.width); }

        const color = s.hue === 200
          ? `rgba(120,200,255,${s.alpha})`
          : s.hue === 270
          ? `rgba(180,130,255,${s.alpha})`
          : `rgba(255,255,255,${s.alpha})`;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
