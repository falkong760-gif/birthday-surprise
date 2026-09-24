import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import config from '../config.js';
import audioManager from '../audio/audioManager.js';
import ParticleField from '../effects/particles.jsx';

export function EntryScreen({ onNext }) {
  const containerRef = useRef(null);
  const [clicked, setClicked] = useState(false);

  const words = (config.entryText || 'A little surprise awaits...').split(' ');

  // Setup entrance animation using gsap.context
  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const tl = gsap.timeline();

      if (prefersReducedMotion) {
        tl.fromTo(
          '.word',
          { opacity: 0 },
          { opacity: 1, duration: 0.3, stagger: 0.1 }
        ).fromTo(
          '.entry-btn',
          { opacity: 0 },
          { opacity: 1, duration: 0.4 },
          '+=0.2'
        );
      } else {
        tl.fromTo(
          '.word',
          { opacity: 0, y: 15, filter: 'blur(4px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.6,
            stagger: 0.12,
            ease: 'power3.out',
          }
        ).fromTo(
          '.entry-btn',
          { opacity: 0, scale: 0.9, y: 10 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: 'back.out(1.4)',
          },
          '+=0.2'
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleEnter = () => {
    if (clicked) return;
    setClicked(true);

    // Initialize Web Audio API on direct user gesture
    audioManager.init();
    audioManager.fadeIn(3, 0.35);
    audioManager.play('transition-whoosh');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    gsap.to('.entry-content', {
      opacity: 0,
      y: prefersReducedMotion ? 0 : -20,
      duration: prefersReducedMotion ? 0.2 : 0.4,
      ease: 'power2.in',
      onComplete: () => {
        if (onNext) onNext();
      },
    });
  };

  return (
    <div
      ref={containerRef}
      className="scene entry-scene"
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
        background: 'radial-gradient(circle at 50% 50%, #2a0818 0%, #0d0006 100%)',
      }}
    >
      <ParticleField count={45} color="rgba(212, 175, 55, 0.6)" speed={0.5} />

      {/* Ambient purple/wine glow */}
      <div
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(92, 15, 36, 0.4) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="entry-content"
        style={{
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-5)',
          padding: '0 var(--space-4)',
          textAlign: 'center',
          maxWidth: '650px',
        }}
      >
        <h1
          className="glow-gold"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            fontWeight: '300',
            lineHeight: 1.3,
            color: 'var(--champagne-light)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.35em',
            margin: 0,
          }}
        >
          {words.map((word, index) => (
            <span key={`${word}-${index}`} className="word" style={{ display: 'inline-block' }}>
              {word}
            </span>
          ))}
        </h1>

        <button
          type="button"
          className="btn-gold glow-gold-box entry-btn"
          onClick={handleEnter}
          disabled={clicked}
          style={{
            fontFamily: 'var(--font-body)',
            letterSpacing: '0.15em',
            padding: '16px 36px',
            fontSize: '1rem',
            cursor: clicked ? 'default' : 'pointer',
            marginTop: 'var(--space-3)',
          }}
        >
          {config.entryButton}
        </button>
      </div>
    </div>
  );
}

export default EntryScreen;
