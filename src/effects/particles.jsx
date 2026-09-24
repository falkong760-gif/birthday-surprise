import { useEffect, useRef } from 'react';

export default function ParticleField({
  count = 60,
  color = '#D4AF7A',
  speed = 1,
  sizeMin = 1,
  sizeMax = 3,
  className = '',
  style = {},
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let particles = [];

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      const height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Adjust particle count for mobile screens
      const isMobile = width < 600;
      const effectiveCount = Math.floor(isMobile ? count * 0.4 : count);

      initParticles(effectiveCount, width, height);
    };

    const initParticles = (numParticles, width, height) => {
      particles = [];
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * (sizeMax - sizeMin) + sizeMin,
          alpha: Math.random() * 0.6 + 0.2,
          speedY: (Math.random() * 0.4 + 0.1) * speed,
          speedX: (Math.random() * 0.2 - 0.1) * speed,
          pulseSpeed: Math.random() * 0.02 + 0.005,
        });
      }
    };

    const render = () => {
      const width = canvas.style.width ? parseInt(canvas.style.width, 10) : window.innerWidth;
      const height = canvas.style.height ? parseInt(canvas.style.height, 10) : window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.005;

        // Wrap around top/bottom/edges
        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = Math.max(0.1, Math.min(0.8, p.alpha));
        ctx.shadowBlur = p.radius * 2;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    handleResize();
    render();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [count, color, speed, sizeMin, sizeMax]);

  return (
    <canvas
      ref={canvasRef}
      className={`particle-field ${className}`}
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
