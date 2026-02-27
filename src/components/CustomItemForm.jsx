import { useState } from 'react';

export default function CustomItemForm({ onAdd, onCancel }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    const numPrice = parseFloat(price);
    if (!trimmed || isNaN(numPrice) || numPrice <= 0) return;
    onAdd(trimmed, numPrice);
    setName('');
    setPrice('');
  }

  return (
    <form className="custom-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Item Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Patch Panel"
          autoFocus
        />
      </div>
      <div className="form-group">
        <label>Unit Price</label>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
        />
      </div>
      <button type="submit" className="btn btn-primary btn-sm">
        Add
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
        ×
      </button>
    </form>
  );
}
