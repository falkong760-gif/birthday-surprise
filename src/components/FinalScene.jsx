import config from '../config.js';

export default function FinalScene({ onNext }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-4)',
      }}
    >
      <p className="subtitle glow-gold" style={{ textTransform: 'uppercase' }}>
        Placeholder Scene
      </p>
      <h1 className="title">🌟 Final Scene</h1>
      <p className="body-text">{config.finalMessage}</p>
      {onNext && (
        <button type="button" className="btn-gold" onClick={onNext} style={{ marginTop: 'var(--space-4)' }}>
          Replay Experience &rarr;
        </button>
      )}
    </div>
  );
}
