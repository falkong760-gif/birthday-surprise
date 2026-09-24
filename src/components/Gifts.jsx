export function Gifts({ onNext }) {
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
        Gifts Scene Placeholder
      </h2>
      <p style={{ color: 'var(--ivory)', marginTop: '1rem' }}>
        (Gifts & Memories Interactive Scene coming in future phases)
      </p>
      {onNext && (
        <button
          type="button"
          className="btn-gold glow-gold-box"
          onClick={onNext}
          style={{ marginTop: '2rem' }}
        >
          Next Scene &rarr;
        </button>
      )}
    </div>
  );
}

export default Gifts;
