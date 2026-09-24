import config from '../config.js';

export function Final({ onNext }) {
  return (
    <div
      className="scene"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, #1e0512 0%, #080004 100%)',
        textAlign: 'center',
        padding: '0 var(--space-4)',
      }}
    >
      <h2 className="glow-gold" style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem' }}>
        Final Scene Placeholder
      </h2>
      <p className="glow-pulse" style={{ color: 'var(--gold)', marginTop: '1rem', fontSize: '1.25rem' }}>
        "{config.finalMessage}"
      </p>
      {onNext && (
        <button
          type="button"
          className="btn-gold glow-gold-box"
          onClick={onNext}
          style={{ marginTop: '2rem' }}
        >
          Restart Experience &rarr;
        </button>
      )}
    </div>
  );
}

export default Final;
