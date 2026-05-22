import { useState } from 'react';

function AdminLoginModal({ isSupabaseConfigured, onClose, onSignIn, onSignUp }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    const action = mode === 'signup' ? onSignUp : onSignIn;
    const ok = await action({ username, password });
    setError(ok ? '' : mode === 'signup' ? 'Could not create account' : 'Wrong sign in details');
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal-panel login-modal" onSubmit={submit}>
        <header>
          <div>
            <h2>{mode === 'signup' ? 'Create Account' : 'Sign In'}</h2>
            <p>{isSupabaseConfigured ? 'Use email/password to manage your own notebooks.' : 'Local demo mode uses admin / code123.'}</p>
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

        <label>
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={isSupabaseConfigured ? 'Your Supabase password' : 'code123'}
            type="password"
          />
        </label>

        {error && <span className="form-error">{error}</span>}

        <footer>
          <button type="button" className="plain-button" onClick={onClose}>Cancel</button>
          {isSupabaseConfigured && (
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
          <button className="primary-button">{mode === 'signup' ? 'Create' : 'Sign In'}</button>
        </footer>
      </form>
    </div>
  );
}

export default AdminLoginModal;
