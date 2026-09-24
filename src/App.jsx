import { useState } from 'react';
import config from './config.js';

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

  const currentScene = SCENES[currentSceneIndex];

  const goTo = (scene) => {
    const idx = SCENES.indexOf(scene);
    if (idx !== -1) {
      setCurrentSceneIndex(idx);
    }
  };

  const next = () => {
    setCurrentSceneIndex((prev) => (prev + 1) % SCENES.length);
  };

  const prev = () => {
    setCurrentSceneIndex((prev) => (prev - 1 + SCENES.length) % SCENES.length);
  };

  return (
    <div className="scene">
      <div
        className="fade-up"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-4)',
          maxWidth: '800px',
          width: '100%',
        }}
      >
        <p className="subtitle glow-gold" style={{ textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          {config.birthdayDateShort}
        </p>

        <h1 className="title glow-pulse">
          Happy Birthday, {config.recipientName}!
        </h1>

        <p className="body-text" style={{ color: 'var(--ivory)', fontStyle: 'italic' }}>
          "{config.finalMessage}"
        </p>

        {/* Current Active Scene Display */}
        <div
          style={{
            margin: 'var(--space-3) 0',
            padding: 'var(--space-3) var(--space-5)',
            border: '1px solid var(--wine)',
            backgroundColor: 'rgba(92, 15, 36, 0.25)',
            borderRadius: '8px',
          }}
        >
          <span style={{ color: 'var(--gold)', fontWeight: '600' }}>Active Scene: </span>
          <span className="glow-purple" style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
            {currentScene}
          </span>{' '}
          <span style={{ opacity: 0.7 }}>
            ({currentSceneIndex + 1} of {SCENES.length})
          </span>
        </div>

        {/* Scene Navigation Controls */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <button type="button" className="btn-gold" onClick={prev}>
            &larr; Previous Scene
          </button>
          <button type="button" className="btn-gold glow-gold-box" onClick={next}>
            Next Scene &rarr;
          </button>
        </div>

        {/* Scene Jump Selector */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: 'var(--space-2)',
          }}
        >
          {SCENES.map((scene, idx) => (
            <button
              key={scene}
              type="button"
              onClick={() => goTo(scene)}
              style={{
                background: idx === currentSceneIndex ? 'var(--gold)' : 'transparent',
                color: idx === currentSceneIndex ? 'var(--bg-main)' : 'var(--gold)',
                border: '1px solid var(--gold)',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
            >
              {scene}
            </button>
          ))}
        </div>

        {/* Config Content Preview Demo */}
        <div
          style={{
            marginTop: 'var(--space-4)',
            fontSize: '0.85rem',
            color: 'var(--text-main)',
            opacity: 0.8,
            maxWidth: '600px',
          }}
        >
          <p style={{ marginBottom: 'var(--space-2)' }}>
            <strong>Config Letter Preview:</strong> {config.letterText}
          </p>
          <p>
            <strong>Config Gift Labels:</strong> {config.giftLabels.join(' • ')}
          </p>
        </div>
      </div>
    </div>
  );
}
