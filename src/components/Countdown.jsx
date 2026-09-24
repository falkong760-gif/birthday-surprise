import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import audioManager from '../audio/audioManager.js';
import ParticleField from '../effects/particles.jsx';

export function Countdown({ onNext }) {
  const containerRef = useRef(null);
  const flashRef = useRef(null);
  const [currentNum, setCurrentNum] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const numbers = ['3', '2', '1'];

      const tl = gsap.timeline({
        onComplete: () => {
          // After 1, short gold flash (~0.3s) with transition-whoosh
          audioManager.play('transition-whoosh');

          if (flashRef.current) {
            gsap.fromTo(
              flashRef.current,
              { opacity: 0 },
              {
                opacity: 0.85,
                duration: 0.15,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                  if (onNext) onNext();
                },
              }
            );
          } else {
            if (onNext) onNext();
          }
        },
      });

      numbers.forEach((num) => {
        // Timeline step for each number (exact 1.0s total per number)
        tl.add(() => {
          setCurrentNum(num);
          audioManager.play('countdown-hit');
        });

        // Ring pulse animation for 1.0s
        if (!prefersReducedMotion) {
          tl.fromTo(
            '.pulse-ring',
            { scale: 0.5, opacity: 0.8 },
            { scale: 2.2, opacity: 0, duration: 0.8, ease: 'power2.out' },
            '<+=0.05'
          );
        }

        // Numeral animation (0.35s in, 0.4s hold, 0.25s out = 1.0s)
        if (prefersReducedMotion) {
          tl.fromTo(
            '.number-display',
            { opacity: 0 },
            { opacity: 1, duration: 0.35, ease: 'power1.out' },
            '<0'
          );
          tl.to('.number-display', { opacity: 0, duration: 0.25, ease: 'power1.in' }, '+=0.4');
        } else {
          tl.fromTo(
            '.number-display',
            { scale: 1.4, opacity: 0, filter: 'blur(10px)' },
            {
              scale: 1,
              opacity: 1,
              filter: 'blur(0px)',
              duration: 0.35,
              ease: 'back.out(1.2)',
            },
            '<0'
          );
          tl.to(
            '.number-display',
            {
              scale: 0.8,
              opacity: 0,
              filter: 'blur(6px)',
              duration: 0.25,
              ease: 'power2.in',
            },
            '+=0.4'
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [onNext]);

  return (
    <div
      ref={containerRef}
      className="scene countdown-scene"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 50%, #1a0310 0%, #080004 100%)',
      }}
    >
      <ParticleField count={30} color="rgba(212, 175, 55, 0.5)" speed={0.4} />

      {/* Gold Flash Overlay */}
      <div
        ref={flashRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle, #f9e29c 0%, #d4af37 50%, #5c0f24 100%)',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* Radial pulse ring behind number */}
      <div
        className="pulse-ring"
        style={{
          position: 'absolute',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          border: '2px solid var(--gold)',
          boxShadow: '0 0 30px var(--gold-glow)',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Big numeral display */}
      <div
        className="number-display glow-gold"
        style={{
          zIndex: 2,
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(8rem, 25vw, 16rem)',
          fontWeight: '300',
          color: 'var(--champagne-light)',
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        {currentNum}
      </div>
    </div>
  );
}

export default Countdown;
