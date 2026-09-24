import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import EntryScreen from './components/EntryScreen.jsx';
import Countdown from './components/Countdown.jsx';
import Preparing from './components/Preparing.jsx';
import CakeScene from './components/CakeScene.jsx';
import RevealScene from './components/RevealScene.jsx';
import GiftsScene from './components/GiftsScene.jsx';
import FinalScene from './components/FinalScene.jsx';

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
  const [isDevMode, setIsDevMode] = useState(false);
  const sceneContainerRef = useRef(null);

  // Check URL query params for ?dev=1 or ?dev=true
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('dev') === '1' || params.get('dev') === 'true') {
        setIsDevMode(true);
      }
    }
  }, []);

  const changeSceneTo = (newIndex) => {
    if (isTransitioning || newIndex === currentSceneIndex) return;
    setIsTransitioning(true);

    const container = sceneContainerRef.current;

    // Fade current scene out to black
    gsap.to(container, {
      opacity: 0,
      scale: 0.98,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        setCurrentSceneIndex(newIndex);
        // Fade next scene in
        gsap.to(container, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => {
            setIsTransitioning(false);
          },
        });
      },
    });
  };

  const next = () => {
    const nextIdx = (currentSceneIndex + 1) % SCENES.length;
    changeSceneTo(nextIdx);
  };

  const goTo = (sceneName) => {
    const idx = SCENES.indexOf(sceneName);
    if (idx !== -1) {
      changeSceneTo(idx);
    }
  };

  const currentSceneName = SCENES[currentSceneIndex];

  const renderSceneComponent = () => {
    switch (currentSceneName) {
      case 'entry':
        return <EntryScreen onNext={next} />;
      case 'countdown':
        return <Countdown onNext={next} />;
      case 'preparing':
        return <Preparing onNext={next} />;
      case 'cake':
        return <CakeScene onNext={next} />;
      case 'reveal':
        return <RevealScene onNext={next} />;
      case 'gifts':
        return <GiftsScene onNext={next} />;
      case 'final':
        return <FinalScene onNext={next} />;
      default:
        return <EntryScreen onNext={next} />;
    }
  };

  return (
    <div className="scene" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Active Scene Viewport with Transition Overlay */}
      <div
        ref={sceneContainerRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: isTransitioning ? 'none' : 'auto',
        }}
      >
        {renderSceneComponent()}
      </div>

      {/* Hidden Developer Mode Controls (?dev=1) */}
      {isDevMode && (
        <div
          style={{
            position: 'fixed',
            bottom: '12px',
            right: '12px',
            zIndex: 9999,
            background: 'rgba(5, 5, 9, 0.85)',
            border: '1px solid var(--gold)',
            borderRadius: '6px',
            padding: '8px 12px',
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            boxShadow: '0 0 12px rgba(0,0,0,0.8)',
          }}
        >
          <span style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 'bold' }}>DEV:</span>
          {SCENES.map((scene) => (
            <button
              key={scene}
              type="button"
              onClick={() => goTo(scene)}
              style={{
                background: currentSceneName === scene ? 'var(--gold)' : 'transparent',
                color: currentSceneName === scene ? 'var(--bg-main)' : 'var(--ivory)',
                border: '1px solid var(--gold)',
                borderRadius: '3px',
                padding: '2px 6px',
                fontSize: '0.65rem',
                cursor: 'pointer',
              }}
            >
              {scene}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
