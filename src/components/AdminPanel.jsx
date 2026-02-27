import { useState } from 'react';
import PinGate from './PinGate';
import { DEFAULT_PRICES, formatCurrency } from '../utils/prices';

const EDITABLE_ITEMS = Object.keys(DEFAULT_PRICES);

export default function AdminPanel({ admin }) {
  const {
    isUnlocked,
    prices,
    companyInfo,
    headerImage,
    close,
    verifyPin,
    updatePrice,
    updateCompanyInfo,
    uploadHeader,
    removeHeader,
  } = admin;

  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState('');

  function startEdit(item) {
    setEditingItem(item);
    setEditValue(String(prices[item] || ''));
  }

  function commitEdit() {
    if (editingItem && editValue !== '') {
      const num = parseFloat(editValue);
      if (!isNaN(num) && num >= 0) {
        updatePrice(editingItem, num);
      }
    }
    setEditingItem(null);
    setEditValue('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') {
      setEditingItem(null);
      setEditValue('');
    }
  }

  function handleHeaderFile(e) {
    const file = e.target.files?.[0];
    if (file) uploadHeader(file);
  }

  return (
    <div className="admin-overlay" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="admin-panel">
        {!isUnlocked ? (
          <>
            <div className="admin-header">
              <h2>Admin</h2>
              <button className="admin-close" onClick={close}>×</button>
            </div>
            <PinGate onSuccess={verifyPin} />
          </>
        ) : (
          <>
            <div className="admin-header">
              <h2>Price List</h2>
              <button className="admin-close" onClick={close}>×</button>
            </div>

            <div className="admin-body">
              {/* Company Info */}
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={companyInfo.name}
                  onChange={(e) => updateCompanyInfo({ name: e.target.value })}
                  placeholder="Your company name"
                />
              </div>
              <div className="form-group">
                <label>Mailing Address</label>
                <input
                  type="text"
                  value={companyInfo.address}
                  onChange={(e) => updateCompanyInfo({ address: e.target.value })}
                  placeholder="P.O. Box 1475, New York, NY 10028"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={companyInfo.phone}
                    onChange={(e) => updateCompanyInfo({ phone: e.target.value })}
                    placeholder="+1(917)565-0579"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) => updateCompanyInfo({ email: e.target.value })}
                    placeholder="info@yourcompany.com"
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label>Website</label>
                <input
                  type="text"
                  value={companyInfo.website}
                  onChange={(e) => updateCompanyInfo({ website: e.target.value })}
                  placeholder="www.yourcompany.com"
                />
              </div>

              {/* Price Table */}
              <table className="price-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Unit Price</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {EDITABLE_ITEMS.map((item) => (
                    <tr key={item}>
                      <td>{item}</td>
                      <td>
                        {editingItem === item ? (
                          <input
                            className="price-input"
                            type="number"
                            min="0"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={handleKeyDown}
                            autoFocus
                          />
                        ) : (
                          formatCurrency(prices[item] || 0)
                        )}
                      </td>
                      <td>
                        {editingItem === item ? null : (
                          <button
                            className="edit-btn"
                            onClick={() => startEdit(item)}
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="admin-footer-note">
                Default prices apply to all new estimates. Custom items are
                priced individually.
              </p>

              {/* Header Image Upload */}
              <div className="header-upload-section">
                <h3>Proposal Header Image</h3>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleHeaderFile}
                />
                {headerImage && (
                  <div className="header-preview">
                    <img src={headerImage} alt="Header preview" />
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={removeHeader}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
