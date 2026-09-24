import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import config from '../config.js';
import audioManager from '../audio/audioManager.js';
import ParticleField from '../effects/particles.jsx';

export default function Preparing({ onNext }) {
  const containerRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const dateRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (onNext) onNext();
        },
      });

      // a) Line 1 fades in, holds ~2.2s, fades out
      tl.fromTo(
        line1Ref.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      )
        .to({}, { duration: 2.2 })
        .to(line1Ref.current, { opacity: 0, y: -15, duration: 0.6, ease: 'power2.in' });

      // b) Line 2 fades in, holds ~2.2s, fades out
      tl.fromTo(
        line2Ref.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      )
        .to({}, { duration: 2.2 })
        .to(line2Ref.current, { opacity: 0, y: -15, duration: 0.6, ease: 'power2.in' });

      // c) DateShort fades in with gold glow and letter-spacing expansion, play magical-shimmer
      tl.add(() => {
        audioManager.play('magical-shimmer');
      });

      tl.fromTo(
        dateRef.current,
        {
          opacity: 0,
          scale: 0.9,
          letterSpacing: '0.08em',
        },
        {
          opacity: 1,
          scale: 1,
          letterSpacing: '0.28em',
          duration: 1.2,
          ease: 'power2.out',
        }
      )
        .to({}, { duration: 2.0 })
        .to(dateRef.current, { opacity: 0, duration: 0.6, ease: 'power2.in' });
    }, containerRef);

    return () => ctx.revert();
  }, [onNext]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        padding: 'var(--space-4)',
        textAlign: 'center',
      }}
    >
      <ParticleField count={45} color="#D4AF7A" speed={0.6} />

      <div style={{ position: 'relative', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Line 1 */}
        <h2
          ref={line1Ref}
          style={{
            position: 'absolute',
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.8rem, 5vw, 3.2rem)',
            color: 'var(--ivory)',
            fontWeight: 400,
            opacity: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {config.preparingLine1}
        </h2>

        {/* Line 2 */}
        <h2
          ref={line2Ref}
          style={{
            position: 'absolute',
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.8rem, 5vw, 3.2rem)',
            color: 'var(--ivory)',
            fontWeight: 400,
            opacity: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {config.preparingLine2}
        </h2>

        {/* Short Date Reveal */}
        <h1
          ref={dateRef}
          className="glow-gold"
          style={{
            position: 'absolute',
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            color: 'var(--gold)',
            fontWeight: 600,
            opacity: 0,
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
          }}
        >
          {config.birthdayDateShort}
        </h1>
      </div>
    </div>
  );
}
