import { useEffect, useRef } from 'react';

export function ParticleField({
  count = 50,
  color = 'rgba(212, 175, 55, 0.7)',
  speed = 0.6,
  minSize = 1,
  maxSize = 3.5,
  className = '',
  style = {},
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = null;
    let width = 0;
    let height = 0;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Adjust particle count for mobile (<600px) and reduced motion
    const isMobile = window.innerWidth < 600;
    let effectiveCount = count;
    if (isMobile) effectiveCount = Math.round(effectiveCount * 0.4);
    if (prefersReducedMotion) effectiveCount = Math.round(effectiveCount * 0.3);
    effectiveCount = Math.max(effectiveCount, 5);

    let particles = [];

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const parent = canvas.parentElement || document.body;
      width = parent.clientWidth || window.innerWidth;
      height = parent.clientHeight || window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initParticles();
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < effectiveCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: minSize + Math.random() * (maxSize - minSize),
          vx: (Math.random() - 0.5) * speed * 0.5,
          vy: - (0.2 + Math.random() * 0.8) * speed,
          alpha: 0.2 + Math.random() * 0.8,
          alphaSpeed: 0.005 + Math.random() * 0.01,
          alphaDirection: Math.random() > 0.5 ? 1 : -1,
        });
      }
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        // Pulse alpha gently
        p.alpha += p.alphaDirection * p.alphaSpeed;
        if (p.alpha >= 0.9) {
          p.alpha = 0.9;
          p.alphaDirection = -1;
        } else if (p.alpha <= 0.1) {
          p.alpha = 0.1;
          p.alphaDirection = 1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color.replace(/[\d.]+\)$/g, `${p.alpha})`);
        ctx.shadowBlur = p.size * 2;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.8)';
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    }

    resize();
    window.addEventListener('resize', resize);
    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [count, color, speed, minSize, maxSize]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        ...style,
      }}
    />
  );
}

export default ParticleField;
