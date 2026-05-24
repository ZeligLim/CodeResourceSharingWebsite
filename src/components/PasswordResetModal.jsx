import { useState } from 'react';

function PasswordResetModal({ busy, onClose, onUpdatePassword }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event) {
    event.preventDefault();

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const result = await onUpdatePassword(password);
    setError(result.ok ? '' : result.message);
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal-panel login-modal" onSubmit={submit}>
        <header>
          <div>
            <h2>Set New Password</h2>
            <p>Enter a new password for your account.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">×</button>
        </header>

        <label>
          New Password
          <span className="password-control">
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type={showPassword ? 'text' : 'password'}
              autoFocus
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </span>
        </label>

        <label>
          Confirm Password
          <span className="password-control">
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              type={showPassword ? 'text' : 'password'}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </span>
        </label>

        {error && <span className="form-error">{error}</span>}

        <footer>
          <button type="button" className="plain-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" disabled={busy}>{busy ? 'Saving...' : 'Update Password'}</button>
        </footer>
      </form>
    </div>
  );
}

export default PasswordResetModal;
