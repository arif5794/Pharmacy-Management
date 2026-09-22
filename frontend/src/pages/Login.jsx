import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email.trim(), password);
    } catch (loginError) {
      const messages = {
        'auth/invalid-credential': 'The email or password is incorrect.',
        'auth/invalid-email': 'Enter a valid email address.',
        'auth/user-disabled': 'This account has been disabled.',
      };
      setError(messages[loginError.code] || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand">EchoPharma</div>
        <h1 id="login-title">Sign in</h1>
        <p className="login-subtitle">Manage your pharmacy operations securely.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="login-error" role="alert">{error}</p>}

          <button className="btn btn-primary login-submit" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;
