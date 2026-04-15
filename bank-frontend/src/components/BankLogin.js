import { useState } from 'react';
import API from '../services/api';

function BankLogin({ onLoginSuccess, onSignupClick }) {
  const [accountId, setAccountId] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!accountId || !identifier || !pin) {
      setError('Account ID, Email/Name and PIN are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Login with account ID, identifier (email or name) and PIN
      const res = await API.post('/login', {
        account_id: accountId,
        identifier: identifier,
        password: pin
      });
      
      if (res.status === 200) {
        onLoginSuccess(accountId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">🏦 Bank Payment Portal</h5>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Account ID</label>
              <input
                type="text"
                className="form-control"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="Enter your Account ID"
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email or Name</label>
              <input
                type="text"
                className="form-control"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your email or name"
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">PIN</label>
              <div className="input-group">
                <input
                  type={showPin ? 'text' : 'password'}
                  className="form-control"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your PIN"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPin(!showPin)}
                  disabled={loading}
                >
                  {showPin ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? '🔄 Logging in...' : '🔓 Login'}
            </button>
          </form>

          <hr />

          <div className="text-center mb-3">
            <p className="text-muted mb-2">Don't have an account?</p>
            <button
              className="btn btn-outline-primary w-100"
              onClick={onSignupClick}
              disabled={loading}
            >
              📝 Create Account
            </button>
          </div>

          <hr />
          <div className="alert alert-info small mb-0">
            <strong>Demo Account:</strong><br />
            Email: demo@bank.com<br />
            PIN: demopin123
          </div>
        </div>
      </div>
    </div>
  );
}

export default BankLogin;
