import { useState } from 'react';
import { ITEM_TYPES, formatCurrency } from '../utils/prices';
import ItemChip from './ItemChip';
import CustomItemForm from './CustomItemForm';

export default function FloorCard({
  floor,
  index,
  prices,
  onUpdateLabel,
  onAddItem,
  onIncrementItem,
  onDecrementItem,
  onRemoveItem,
  onRemoveFloor,
  floorTotal,
}) {
  const [showCustomForm, setShowCustomForm] = useState(false);

  function handleDelete() {
    if (floor.items.length > 0) {
      if (!window.confirm(`Delete "${floor.label}"? This floor has ${floor.items.length} item(s).`)) {
        return;
      }
    }
    onRemoveFloor(floor.id);
  }

  function handlePillClick(type) {
    if (type === 'Custom') {
      setShowCustomForm(true);
    } else {
      onAddItem(floor.id, type);
    }
  }

  function handleCustomAdd(name, price) {
    onAddItem(floor.id, 'Custom', name, price);
    setShowCustomForm(false);
  }

  function pillHasItems(type) {
    if (type === 'Custom') {
      return floor.items.some((i) => i.type === 'Custom');
    }
    return floor.items.some((i) => i.type === type);
  }

  return (
    <div className="card floor-card">
      {/* Header */}
      <div className="floor-header">
        <span className="floor-badge">F{index + 1}</span>
        <input
          className="floor-label-input"
          type="text"
          value={floor.label}
          onChange={(e) => onUpdateLabel(floor.id, e.target.value)}
          placeholder={`Floor ${index + 1}, Basement, Roof, etc.`}
        />
        <button
          className="floor-delete-btn"
          onClick={handleDelete}
          aria-label="Remove floor"
        >
          🗑
        </button>
      </div>

      {/* Item Pills */}
      <div className="pill-row">
        {ITEM_TYPES.map((t) => (
          <button
            key={t.type}
            className={`item-pill${pillHasItems(t.type) ? ' has-items' : ''}`}
            onClick={() => handlePillClick(t.type)}
          >
            <span className="pill-icon">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Custom Item Form */}
      {showCustomForm && (
        <CustomItemForm
          onAdd={handleCustomAdd}
          onCancel={() => setShowCustomForm(false)}
        />
      )}

      {/* Item Chips */}
      {floor.items.length > 0 ? (
        <div className="chips-area">
          {floor.items.map((item) => (
            <ItemChip
              key={item.id}
              item={item}
              prices={prices}
              onIncrement={() => onIncrementItem(floor.id, item.id)}
              onDecrement={() => onDecrementItem(floor.id, item.id)}
              onRemove={() => onRemoveItem(floor.id, item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-items">Tap an item above to start adding</div>
      )}

      {/* Floor Total */}
      <div className="floor-total">
        <span className="floor-total-label">Floor Total</span>
        <span className="floor-total-amount">{formatCurrency(floorTotal)}</span>
      </div>
    </div>
  );
}
