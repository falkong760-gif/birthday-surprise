import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import config from '../config.js';
import audioManager from '../audio/audioManager.js';
import ParticleField from '../effects/particles.jsx';

export function Preparing({ onNext }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const tl = gsap.timeline({
        onComplete: () => {
          if (onNext) onNext();
        },
      });

      // Step a: line 1
      if (prefersReducedMotion) {
        tl.fromTo(
          '.prep-line-1',
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: 'power1.out' }
        ).to('.prep-line-1', { opacity: 0, duration: 0.5, ease: 'power1.in' }, '+=2.2');
      } else {
        tl.fromTo(
          '.prep-line-1',
          { opacity: 0, y: 15, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' }
        ).to(
          '.prep-line-1',
          { opacity: 0, y: -15, filter: 'blur(6px)', duration: 0.6, ease: 'power2.in' },
          '+=2.2'
        );
      }

      // Step b: line 2
      if (prefersReducedMotion) {
        tl.fromTo(
          '.prep-line-2',
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: 'power1.out' }
        ).to('.prep-line-2', { opacity: 0, duration: 0.5, ease: 'power1.in' }, '+=2.2');
      } else {
        tl.fromTo(
          '.prep-line-2',
          { opacity: 0, y: 15, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' }
        ).to(
          '.prep-line-2',
          { opacity: 0, y: -15, filter: 'blur(6px)', duration: 0.6, ease: 'power2.in' },
          '+=2.2'
        );
      }

      // Step c: date display + magical shimmer sound
      tl.add(() => {
        audioManager.play('magical-shimmer');
      });

      if (prefersReducedMotion) {
        tl.fromTo(
          '.prep-date',
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: 'power1.out' }
        ).to('.prep-date', { opacity: 0, duration: 0.5, ease: 'power1.in' }, '+=2.0');
      } else {
        tl.fromTo(
          '.prep-date',
          { opacity: 0, scale: 0.9, letterSpacing: '0.1em', filter: 'blur(8px)' },
          {
            opacity: 1,
            scale: 1,
            letterSpacing: '0.25em',
            filter: 'blur(0px)',
            duration: 1.0,
            ease: 'power2.out',
          }
        ).to(
          '.prep-date',
          { opacity: 0, scale: 1.05, filter: 'blur(6px)', duration: 0.6, ease: 'power2.in' },
          '+=2.0'
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [onNext]);

  return (
    <div
      ref={containerRef}
      className="scene preparing-scene"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 50%, #1e0512 0%, #080004 100%)',
        textAlign: 'center',
        padding: '0 var(--space-4)',
      }}
    >
      <ParticleField count={40} color="rgba(212, 175, 55, 0.6)" speed={0.5} />

      {/* Line 1 */}
      <h2
        className="prep-line-1 glow-gold"
        style={{
          position: 'absolute',
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.8rem, 5vw, 3.2rem)',
          fontWeight: '300',
          color: 'var(--champagne-light)',
          margin: 0,
          opacity: 0,
        }}
      >
        {config.preparingLine1}
      </h2>

      {/* Line 2 */}
      <h2
        className="prep-line-2 glow-gold"
        style={{
          position: 'absolute',
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.8rem, 5vw, 3.2rem)',
          fontWeight: '300',
          color: 'var(--champagne-light)',
          margin: 0,
          opacity: 0,
        }}
      >
        {config.preparingLine2}
      </h2>

      {/* Birthday Date Short */}
      <div
        className="prep-date glow-pulse"
        style={{
          position: 'absolute',
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2rem, 6vw, 4rem)',
          fontWeight: '400',
          color: 'var(--gold)',
          margin: 0,
          opacity: 0,
          textTransform: 'uppercase',
        }}
      >
        {config.birthdayDateShort}
      </div>
    </div>
  );
}

export default Preparing;
