import { useState } from 'react';
import API from '../services/api';

function BankSignup({ onSignupSuccess, onBackClick }) {
  const [fullName, setFullName] = useState('');
  const [accountType, setAccountType] = useState('savings');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [initialBalance, setInitialBalance] = useState('1000');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const validateForm = () => {
    if (!fullName.trim()) {
      setError('Full name is required');
      return false;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Valid email is required');
      return false;
    }

    if (!phone.trim() || phone.length < 10) {
      setError('Valid phone number is required');
      return false;
    }

    if (!pin.trim()) {
      setError('PIN is required');
      return false;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return false;
    }

    if (pin.length < 4) {
      setError('PIN must be at least 4 characters');
      return false;
    }

    if (isNaN(initialBalance) || parseFloat(initialBalance) < 0) {
      setError('Initial balance must be a valid positive number');
      return false;
    }

    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Create account via API
      const res = await API.post('/create-account', {
        full_name: fullName,
        account_type: accountType,
        email: email,
        phone: phone,
        pin: pin,
        initial_balance: parseFloat(initialBalance)
      });

      if (res.data && res.data.account_id) {
        setSuccess(`✅ Account created successfully! Account ID: ${res.data.account_id}`);
        
        // Reset form
        setFullName('');
        setEmail('');
        setPhone('');
        setPin('');
        setConfirmPin('');
        setInitialBalance('1000');

        // Redirect to login after 2 seconds
        setTimeout(() => {
          onSignupSuccess();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow" style={{ width: '100%', maxWidth: '500px' }}>
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">📝 Create Bank Account</h5>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}

          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {success}
              <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  disabled={loading}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Account Type</label>
              <select
                className="form-select"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                disabled={loading}
              >
                <option value="savings">Savings Account</option>
                <option value="checking">Checking Account</option>
                <option value="student">Student Account</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">PIN (Password)</label>
              <div className="input-group">
                <input
                  type={showPin ? 'text' : 'password'}
                  className="form-control"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Create your PIN"
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

            <div className="mb-3">
              <label className="form-label">Confirm PIN</label>
              <div className="input-group">
                <input
                  type={showConfirmPin ? 'text' : 'password'}
                  className="form-control"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Confirm your PIN"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  disabled={loading}
                >
                  {showConfirmPin ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Initial Balance (₹)</label>
              <input
                type="number"
                className="form-control"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="Enter initial balance"
                min="0"
                step="100"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-success w-100 mb-2"
              disabled={loading}
            >
              {loading ? '⏳ Creating Account...' : '✅ Create Account'}
            </button>

            <button
              type="button"
              className="btn btn-secondary w-100"
              onClick={onBackClick}
              disabled={loading}
            >
              Back to Login
            </button>
          </form>

          <hr />
          <div className="alert alert-info small mb-0">
            <strong>Requirements:</strong><br />
            • PIN must be at least 4 characters (text or numbers)<br />
            • Initial balance must be positive<br />
            • All fields are required
          </div>
        </div>
      </div>
    </div>
  );
}

export default BankSignup;
