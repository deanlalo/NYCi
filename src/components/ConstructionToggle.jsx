export default function ConstructionToggle({ value, onChange }) {
  return (
    <div className="construction-toggle">
      <button
        className={`toggle-pill${value === 'ground-up' ? ' active' : ''}`}
        onClick={() => onChange('ground-up')}
      >
        Ground-Up / Open Walls
      </button>
      <button
        className={`toggle-pill${value === 'existing' ? ' active' : ''}`}
        onClick={() => onChange('existing')}
      >
        Existing Construction
      </button>
    </div>
  );
}
