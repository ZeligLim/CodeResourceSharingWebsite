import { useState } from 'react';

function AdminLoginModal({ isSupabaseConfigured, onClose, onForgotPassword, onSignIn, onSignUp }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const action = mode === 'signup'
      ? onSignUp
      : mode === 'forgot'
        ? onForgotPassword
        : onSignIn;
    const result = await action({ username, password });
    const ok = typeof result === 'boolean' ? result : result.ok;
    const message = typeof result === 'boolean' ? '' : result.message;

    setError(ok ? '' : message || (mode === 'signup' ? 'Could not create account' : 'Wrong sign in details'));
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal-panel login-modal" onSubmit={submit}>
        <header>
          <div>
            <h2>{mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : 'Sign In'}</h2>
            <p>
              {mode === 'forgot'
                ? 'Enter your email and Supabase will send a reset link.'
                : isSupabaseConfigured
                  ? 'Use email/password to manage your own notebooks.'
                  : 'Local demo mode uses admin / code123.'}
            </p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">×</button>
        </header>

        <label>
          {isSupabaseConfigured ? 'Email' : 'Username'}
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder={isSupabaseConfigured ? 'admin@example.com' : 'admin'}
            autoFocus
          />
        </label>

        {mode !== 'forgot' && (
          <div className="password-row">
            <label>
              Password
              <span className="password-control">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={isSupabaseConfigured ? 'Your password' : 'code123'}
                  type={showPassword ? 'text' : 'password'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </span>
            </label>
            {isSupabaseConfigured && mode === 'signin' && (
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setError('');
                  setMode('forgot');
                }}
              >
                Forgot password?
              </button>
            )}
          </div>
        )}

        {error && <span className="form-error">{error}</span>}

        <footer>
          <button type="button" className="plain-button" onClick={onClose}>Cancel</button>
          {isSupabaseConfigured && mode !== 'forgot' && (
            <button
              type="button"
              className="plain-button"
              onClick={() => {
                setError('');
                setMode(mode === 'signup' ? 'signin' : 'signup');
              }}
            >
              {mode === 'signup' ? 'Use Sign In' : 'Create Account'}
            </button>
          )}
          {isSupabaseConfigured && mode === 'forgot' && (
            <button
              type="button"
              className="plain-button"
              onClick={() => {
                setError('');
                setMode('signin');
              }}
            >
              Use Sign In
            </button>
          )}
          <button className="primary-button">{mode === 'signup' ? 'Create' : mode === 'forgot' ? 'Send Link' : 'Sign In'}</button>
        </footer>
      </form>
    </div>
  );
}

export default AdminLoginModal;
