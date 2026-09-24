import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import EntryScreen from './components/EntryScreen.jsx';
import Countdown from './components/Countdown.jsx';
import Preparing from './components/Preparing.jsx';
import Cake from './components/Cake.jsx';
import Reveal from './components/Reveal.jsx';
import Gifts from './components/Gifts.jsx';
import Final from './components/Final.jsx';

const SCENES = [
  'entry',
  'countdown',
  'preparing',
  'cake',
  'reveal',
  'gifts',
  'final',
];

export default function App() {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDev, setIsDev] = useState(false);

  const transitionOverlayRef = useRef(null);
  const sceneContainerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      setIsDev(searchParams.get('dev') === '1');
    }
  }, []);

  const currentScene = SCENES[currentSceneIndex];

  /**
   * App handles cinematic scene transitions (fade through black)
   */
  const transitionToSceneIndex = (targetIndex) => {
    if (isTransitioning || targetIndex === currentSceneIndex) return;
    if (targetIndex < 0 || targetIndex >= SCENES.length) return;

    setIsTransitioning(true);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const halfDuration = prefersReducedMotion ? 0.2 : 0.4;

    const overlay = transitionOverlayRef.current;
    const container = sceneContainerRef.current;

    const tl = gsap.timeline();

    // Step 1: Fade out current scene to black
    if (container && !prefersReducedMotion) {
      tl.to(container, { scale: 0.98, filter: 'blur(4px)', duration: halfDuration, ease: 'power2.in' }, 0);
    }
    if (overlay) {
      tl.to(overlay, { opacity: 1, duration: halfDuration, ease: 'power2.in' }, 0);
    }

    // Step 2: Swap active scene at black midpoint
    tl.add(() => {
      setCurrentSceneIndex(targetIndex);
    });

    // Step 3: Fade in new scene from black
    if (container && !prefersReducedMotion) {
      tl.set(container, { scale: 1, filter: 'blur(0px)' });
    }
    if (overlay) {
      tl.to(overlay, { opacity: 0, duration: halfDuration, ease: 'power2.out' });
    }

    tl.add(() => {
      setIsTransitioning(false);
    });
  };

  const next = () => {
    const nextIdx = (currentSceneIndex + 1) % SCENES.length;
    transitionToSceneIndex(nextIdx);
  };

  const goTo = (sceneName) => {
    const targetIdx = SCENES.indexOf(sceneName);
    if (targetIdx !== -1) {
      transitionToSceneIndex(targetIdx);
    }
  };

  const renderSceneComponent = () => {
    switch (currentScene) {
      case 'entry':
        return <EntryScreen onNext={next} />;
      case 'countdown':
        return <Countdown onNext={next} />;
      case 'preparing':
        return <Preparing onNext={next} />;
      case 'cake':
        return <Cake onNext={next} />;
      case 'reveal':
        return <Reveal onNext={next} />;
      case 'gifts':
        return <Gifts onNext={next} />;
      case 'final':
        return <Final onNext={next} />;
      default:
        return <EntryScreen onNext={next} />;
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#080004',
      }}
    >
      {/* Active Scene Content */}
      <div
        ref={sceneContainerRef}
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: isTransitioning ? 'none' : 'auto',
        }}
      >
        {renderSceneComponent()}
      </div>

      {/* Fullscreen Fade Transition Overlay */}
      <div
        ref={transitionOverlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#080004',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 9000,
        }}
      />

      {/* Input Blocker during scene transitions */}
      {isTransitioning && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9500,
            cursor: 'wait',
          }}
        />
      )}

      {/* Developer Mode Scene Jumper (?dev=1) */}
      {isDev && (
        <div
          style={{
            position: 'fixed',
            bottom: '12px',
            right: '12px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '4px',
            background: 'rgba(8, 0, 4, 0.85)',
            border: '1px solid var(--wine)',
            padding: '6px 8px',
            borderRadius: '6px',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            maxWidth: '90vw',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              color: 'var(--gold)',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              opacity: 0.8,
            }}
          >
            DEV SCENE JUMPER
          </div>
          <div
            style={{
              display: 'flex',
              gap: '4px',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
            }}
          >
            {SCENES.map((scene, idx) => (
              <button
                key={scene}
                type="button"
                onClick={() => goTo(scene)}
                disabled={isTransitioning}
                style={{
                  background: idx === currentSceneIndex ? 'var(--gold)' : 'transparent',
                  color: idx === currentSceneIndex ? 'var(--bg-main)' : 'var(--champagne-light)',
                  border: '1px solid var(--gold)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  cursor: isTransitioning ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  lineHeight: '1.2',
                  opacity: idx === currentSceneIndex ? 1 : 0.7,
                }}
              >
                {scene}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
