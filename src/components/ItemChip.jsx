import { getItemPrice, getItemName, getItemIcon, formatCurrency } from '../utils/prices';

export default function ItemChip({
  item,
  prices,
  onIncrement,
  onDecrement,
  onRemove,
}) {
  const unitPrice = getItemPrice(item, prices);
  const lineTotal = unitPrice * item.qty;
  const icon = getItemIcon(item.type);
  const name = getItemName(item);

  return (
    <div className="item-chip">
      <span className="chip-icon">{icon}</span>
      <span className="chip-name">{name}</span>

      <div className="chip-qty-controls">
        <button className="qty-btn" onClick={onDecrement} aria-label="Decrease quantity">
          −
        </button>
        <span className="qty-count">{item.qty}</span>
        <button className="qty-btn" onClick={onIncrement} aria-label="Increase quantity">
          +
        </button>
      </div>

      <span className="chip-price">{formatCurrency(unitPrice)}</span>
      <span className="chip-total">{formatCurrency(lineTotal)}</span>

      <button className="chip-remove" onClick={onRemove} aria-label="Remove item">
        ×
      </button>
    </div>
  );
}
