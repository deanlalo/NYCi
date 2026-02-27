import { useState } from 'react';
import {
  getItemPrice,
  getItemName,
  formatCurrency,
} from '../utils/prices';

function SummaryContent({ state, prices, grandTotal, getFloorTotal, onPDF, onExcel }) {
  const address = state.project.address || 'Untitled Project';
  const constructionLabel =
    state.project.constructionType === 'ground-up'
      ? 'Ground-Up / Open Walls'
      : 'Existing Construction';

  return (
    <>
      <div className="summary-section-label">Estimate Summary</div>
      <div className="summary-address">{address}</div>
      <span className="summary-badge">{constructionLabel}</span>
      <div className="summary-divider" />

      {state.floors.map((floor) => {
        const ft = getFloorTotal(floor);
        return (
          <div key={floor.id} style={{ marginBottom: 12 }}>
            <div className="summary-floor-label">{floor.label || 'Unnamed Floor'}</div>
            {floor.items.map((item) => {
              const unit = getItemPrice(item, prices);
              const total = unit * item.qty;
              return (
                <div className="summary-floor-item" key={item.id}>
                  <span>
                    {getItemName(item)} — {item.qty} × {formatCurrency(unit)}
                  </span>
                  <span>{formatCurrency(total)}</span>
                </div>
              );
            })}
            {floor.items.length === 0 && (
              <div className="summary-floor-item">
                <span style={{ fontStyle: 'italic' }}>No items</span>
                <span>$0.00</span>
              </div>
            )}
            <div className="summary-floor-subtotal">{formatCurrency(ft)}</div>
          </div>
        );
      })}

      <div className="summary-divider" />
      <div className="summary-grand-label">Grand Total</div>
      <div className="summary-grand-total">{formatCurrency(grandTotal)}</div>
      <div className="summary-divider" />

      <div className="summary-buttons">
        <button className="btn btn-primary" onClick={onPDF}>
          Download PDF
        </button>
        <button className="btn btn-outline" onClick={onExcel}>
          Download Excel
        </button>
      </div>
    </>
  );
}

export default function SummaryDrawer({
  state,
  prices,
  grandTotal,
  getFloorTotal,
  onPDF,
  onExcel,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="summary-desktop">
        <SummaryContent
          state={state}
          prices={prices}
          grandTotal={grandTotal}
          getFloorTotal={getFloorTotal}
          onPDF={onPDF}
          onExcel={onExcel}
        />
      </aside>

      {/* Mobile bottom sheet */}
      <div className={`summary-mobile${expanded ? ' expanded' : ''}`}>
        <div
          className="summary-mobile-bar"
          onClick={() => setExpanded(!expanded)}
          role="button"
          tabIndex={0}
        >
          <span className="summary-mobile-label">Total</span>
          <span className="summary-mobile-total">{formatCurrency(grandTotal)}</span>
          <span className="summary-mobile-chevron">{expanded ? '▼' : '▲'}</span>
        </div>
        {expanded && (
          <div className="summary-mobile-content">
            <SummaryContent
              state={state}
              prices={prices}
              grandTotal={grandTotal}
              getFloorTotal={getFloorTotal}
              onPDF={onPDF}
              onExcel={onExcel}
            />
          </div>
        )}
      </div>
    </>
  );
}
