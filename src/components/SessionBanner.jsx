export default function SessionBanner({ onDismiss, onStartFresh }) {
  return (
    <div className="session-banner">
      <span>
        Estimate restored from last session.{' '}
        <a onClick={onStartFresh} role="button" tabIndex={0}>
          Start Fresh
        </a>
      </span>
      <button className="dismiss-btn" onClick={onDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
