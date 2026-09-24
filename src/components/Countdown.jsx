import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import audioManager from '../audio/audioManager.js';
import ParticleField from '../effects/particles.jsx';

export default function Countdown({ onNext }) {
  const containerRef = useRef(null);
  const numberRef = useRef(null);
  const ringRef = useRef(null);
  const flashRef = useRef(null);

  useEffect(() => {
    const numbers = ['3', '2', '1'];
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          // Short gold flash before proceeding to next scene
          if (flashRef.current) {
            audioManager.play('transition-whoosh');
            gsap.to(flashRef.current, {
              opacity: 1,
              duration: 0.15,
              yoyo: true,
              repeat: 1,
              ease: 'power2.inOut',
              onComplete: () => {
                if (onNext) onNext();
              },
            });
          } else if (onNext) {
            onNext();
          }
        },
      });

      numbers.forEach((num) => {
        tl.add(() => {
          if (numberRef.current) {
            numberRef.current.innerText = num;
          }
          audioManager.play('countdown-hit');
        });

        // 0.35s animate in
        tl.fromTo(
          numberRef.current,
          {
            scale: 1.4,
            opacity: 0,
            filter: 'blur(10px)',
          },
          {
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.35,
            ease: 'power2.out',
          }
        );

        // Pulse ring effect alongside number appearance
        tl.fromTo(
          ringRef.current,
          {
            scale: 0.5,
            opacity: 0.8,
            borderWidth: '3px',
          },
          {
            scale: 2.2,
            opacity: 0,
            borderWidth: '1px',
            duration: 0.75,
            ease: 'power2.out',
          },
          '<'
        );

        // 0.4s hold
        tl.to({}, { duration: 0.4 });

        // 0.25s animate out
        tl.to(numberRef.current, {
          scale: 0.8,
          opacity: 0,
          filter: 'blur(10px)',
          duration: 0.25,
          ease: 'power2.in',
        });
      });
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
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
      }}
    >
      <ParticleField count={40} color="#D4AF7A" speed={1} />

      {/* Radial Gold Pulse Ring */}
      <div
        ref={ringRef}
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: '2px solid var(--gold)',
          boxShadow: '0 0 25px rgba(212, 175, 122, 0.6)',
          pointerEvents: 'none',
          opacity: 0,
        }}
      />

      {/* Countdown Numeral */}
      <h1
        ref={numberRef}
        className="glow-gold"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(6rem, 20vw, 12rem)',
          fontWeight: 700,
          color: 'var(--gold)',
          userSelect: 'none',
          zIndex: 2,
          margin: 0,
          lineHeight: 1,
        }}
      >
        3
      </h1>

      {/* Gold Flash Overlay */}
      <div
        ref={flashRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--gold)',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />
    </div>
  );
}
