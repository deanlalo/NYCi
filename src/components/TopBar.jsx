export default function TopBar({ onAdmin, onNewEstimate }) {
  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <span className="app-logo">
          LV<span className="logo-dot">/</span>
        </span>
        <span className="app-name">LV Estimator</span>
      </div>
      <div className="top-bar-right">
        <button className="btn btn-ghost" onClick={onAdmin}>
          Admin
        </button>
        <button className="btn btn-primary" onClick={onNewEstimate}>
          New Estimate
        </button>
      </div>
    </header>
  );
}
