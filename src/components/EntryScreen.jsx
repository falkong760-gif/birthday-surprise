import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import config from '../config.js';
import audioManager from '../audio/audioManager.js';
import ParticleField from '../effects/particles.jsx';

export default function EntryScreen({ onNext }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const buttonRef = useRef(null);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Split text into words for staggered animation
      const textEl = textRef.current;
      if (textEl && !textEl.dataset.split) {
        textEl.dataset.split = 'true';
        const words = config.entryText.split(' ');
        textEl.innerHTML = words
          .map(
            (word) =>
              `<span class="entry-word" style="display:inline-block; opacity:0; transform:translateY(15px); margin-right: 0.3em;">${word}</span>`
          )
          .join('');
      }

      const tl = gsap.timeline();

      // Fade in words with gentle stagger
      tl.to('.entry-word', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.18,
        ease: 'power2.out',
      });

      // Fade up button after text
      tl.to(
        buttonRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
        },
        '-=0.2'
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);

    // Initialize Web Audio API on user gesture
    audioManager.init();
    audioManager.fadeIn(3, 0.35);
    audioManager.play('transition-whoosh');

    // Animate elements out before completing
    const ctx = gsap.context(() => {
      gsap.to([textRef.current, buttonRef.current], {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          if (onNext) onNext();
        },
      });
    }, containerRef);
  };

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
      }}
    >
      <ParticleField count={50} color="#D4AF7A" speed={0.8} />

      {/* Ambient purple backlight glow */}
      <div
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'var(--glow-purple)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          padding: 'var(--space-4)',
        }}
      >
        <h1
          ref={textRef}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2.2rem, 6vw, 4.2rem)',
            color: 'var(--ivory)',
            marginBottom: 'var(--space-6)',
            fontWeight: 400,
            letterSpacing: '0.04em',
          }}
        >
          {config.entryText}
        </h1>

        <button
          ref={buttonRef}
          type="button"
          className="btn-gold glow-pulse"
          onClick={handleClick}
          style={{
            opacity: 0,
            transform: 'translateY(20px)',
            cursor: clicked ? 'default' : 'pointer',
          }}
        >
          {config.entryButton}
        </button>
      </div>
    </div>
  );
}
