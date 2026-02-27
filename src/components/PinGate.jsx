import { useState, useRef, useEffect } from 'react';

export default function PinGate({ onSuccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleChange(e) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(val);
    setError(false);

    if (val.length === 4) {
      const ok = onSuccess(val);
      if (!ok) {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 600);
      }
    }
  }

  return (
    <div className="pin-gate">
      <h3>Admin Access</h3>
      <p>Enter the 4-digit PIN to continue</p>
      <input
        ref={inputRef}
        className={`pin-input${error ? ' pin-shake' : ''}`}
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={pin}
        onChange={handleChange}
        autoComplete="off"
      />
      {error && <span className="pin-error">Wrong PIN</span>}
    </div>
  );
}
