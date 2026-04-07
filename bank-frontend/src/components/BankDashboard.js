import { useState, useEffect } from 'react';
import API from '../services/api';

function BankDashboard({ accountEmail, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [accountData, setAccountData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccountData();
  }, [accountEmail]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/customer/${accountEmail}/balance`);
      setAccountData(res.data);
      
      // Fetch transaction history
      if (res.data.account_id) {
        const historyRes = await API.get(`/account/${res.data.account_id}/history`);
        setTransactions(historyRes.data || []);
      }
      
      setError('');
    } catch (err) {
      setError('Failed to load account data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    const icons = {
      'deposit': '💰',
      'withdraw': '🏧',
      'transfer_sent': '↗️',
      'transfer_received': '↙️'
    };
    return icons[type] || '💳';
  };

  const getTransactionColor = (type) => {
    const colors = {
      'deposit': 'text-success',
      'transfer_received': 'text-success',
      'withdraw': 'text-danger',
      'transfer_sent': 'text-danger'
    };
    return colors[type] || 'text-secondary';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <nav className="navbar navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">🏦 Bank Portal</span>
          <div className="d-flex gap-2">
            <small className="text-light">{accountEmail}</small>
            <button className="btn btn-outline-light btn-sm" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        {/* Sidebar Navigation */}
        <div className="row">
          <div className="col-md-3">
            <div className="list-group sticky-top" style={{ top: '20px' }}>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                📊 Dashboard
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                👤 Account Details
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                📝 Transaction History
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'transfer' ? 'active' : ''}`}
                onClick={() => setActiveTab('transfer')}
              >
                💸 Transfer Money
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'deposit' ? 'active' : ''}`}
                onClick={() => setActiveTab('deposit')}
              >
                💰 Deposit
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === 'withdraw' ? 'active' : ''}`}
                onClick={() => setActiveTab('withdraw')}
              >
                🏧 Withdraw
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div>
                <h3 className="mb-4">📊 Dashboard</h3>
                
                {accountData && (
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="card border-primary shadow-sm">
                        <div className="card-body">
                          <h6 className="card-subtitle mb-2 text-muted">Current Balance</h6>
                          <h2 className="card-title text-primary">₹{(parseFloat(accountData.balance) || 0).toFixed(2)}</h2>
                          <p className="card-text small text-muted mb-0">
                            {accountData.account_type} • Account ID: {accountData.account_id}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card border-success shadow-sm">
                        <div className="card-body">
                          <h6 className="card-subtitle mb-2 text-muted">Account Status</h6>
                          <p className="mb-2">
                            <span className="badge bg-success">✓ Active</span>
                          </p>
                          <p className="card-text small text-muted mb-0">
                            Email: {accountData.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <h5 className="mb-3">Recent Transactions</h5>
                <div className="card shadow-sm">
                  <div className="card-body">
                    {transactions.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {transactions.slice(0, 5).map((txn, idx) => (
                          <div key={idx} className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                            <div>
                              <span className="me-2">{getTransactionIcon(txn.type)}</span>
                              <small className="text-capitalize">{txn.type.replace('_', ' ')}</small>
                              <br />
                              <small className="text-muted">{new Date(txn.created_at).toLocaleDateString()}</small>
                            </div>
                            <span className={`fw-bold ${getTransactionColor(txn.type)}`}>
                              {txn.type.includes('sent') || txn.type === 'withdraw' ? '-' : '+'}₹{(parseFloat(txn.amount) || 0).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted text-center py-3">No transactions yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Account Details Tab */}
            {activeTab === 'account' && accountData && (
              <div>
                <h3 className="mb-4">👤 Account Details</h3>
                <div className="card shadow-sm">
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label text-muted small">Customer Name</label>
                        <p className="fw-bold">{accountData.name}</p>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small">Email</label>
                        <p className="fw-bold">{accountData.email}</p>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label text-muted small">Account ID</label>
                        <p className="fw-bold">{accountData.account_id}</p>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small">Account Type</label>
                        <p className="fw-bold text-capitalize">{accountData.account_type}</p>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label text-muted small">Current Balance</label>
                        <p className="fw-bold text-primary">₹{(parseFloat(accountData.balance) || 0).toFixed(2)}</p>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small">Account Status</label>
                        <p className="fw-bold"><span className="badge bg-success">✓ Active</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction History Tab */}
            {activeTab === 'history' && (
              <div>
                <h3 className="mb-4">📝 Transaction History</h3>
                <div className="card shadow-sm">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.length > 0 ? (
                          transactions.map((txn, idx) => (
                            <tr key={idx}>
                              <td>{idx + 1}</td>
                              <td>
                                <span className="me-2">{getTransactionIcon(txn.type)}</span>
                                <small className="text-capitalize">{txn.type.replace('_', ' ')}</small>
                              </td>
                              <td className={`fw-bold ${getTransactionColor(txn.type)}`}>
                                {txn.type.includes('sent') || txn.type === 'withdraw' ? '-' : '+'}₹{(parseFloat(txn.amount) || 0).toFixed(2)}
                              </td>
                              <td>{new Date(txn.created_at).toLocaleDateString()}</td>
                              <td><span className="badge bg-success">{txn.status}</span></td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center text-muted py-3">No transactions found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Transfer Money Tab */}
            {activeTab === 'transfer' && (
              <TransferMoney accountId={accountData?.account_id} onSuccess={fetchAccountData} />
            )}

            {/* Deposit Tab */}
            {activeTab === 'deposit' && (
              <DepositMoney accountId={accountData?.account_id} onSuccess={fetchAccountData} />
            )}

            {/* Withdraw Tab */}
            {activeTab === 'withdraw' && (
              <WithdrawMoney accountId={accountData?.account_id} balance={parseFloat(accountData?.balance) || 0} onSuccess={fetchAccountData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Transfer Money Component
function TransferMoney({ accountId, onSuccess }) {
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleTransfer = async (e) => {
    e.preventDefault();
    
    if (!toAccount || !amount) {
      setError('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const res = await API.post('/account/transfer', {
        from_account_id: accountId,
        to_account_id: parseInt(toAccount),
        amount: parseFloat(amount),
        purpose: purpose || 'Transfer'
      });

      setMessage('✅ Transfer successful!');
      setToAccount('');
      setAmount('');
      setPurpose('');
      onSuccess();

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="mb-4">💸 Transfer Money</h3>
      <div className="card shadow-sm">
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <form onSubmit={handleTransfer}>
            <div className="mb-3">
              <label className="form-label">To Account ID</label>
              <input
                type="number"
                className="form-control"
                value={toAccount}
                onChange={(e) => setToAccount(e.target.value)}
                placeholder="Enter recipient account ID"
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                step="100"
                min="0"
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Purpose (Optional)</label>
              <input
                type="text"
                className="form-control"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Enter transfer purpose"
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? '⏳ Processing...' : '✅ Transfer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Deposit Money Component
function DepositMoney({ accountId, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    if (!amount) {
      setError('Please enter amount');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      await API.post('/account/deposit', {
        account_id: accountId,
        amount: parseFloat(amount)
      });

      setMessage('✅ Deposit successful!');
      setAmount('');
      onSuccess();

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="mb-4">💰 Deposit Money</h3>
      <div className="card shadow-sm">
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <form onSubmit={handleDeposit}>
            <div className="mb-3">
              <label className="form-label">Amount to Deposit (₹)</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                step="100"
                min="0"
                disabled={loading}
              />
            </div>

            <div className="alert alert-info small">
              💡 Minimum deposit: ₹100
            </div>

            <button type="submit" className="btn btn-success w-100" disabled={loading}>
              {loading ? '⏳ Processing...' : '✅ Deposit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Withdraw Money Component
function WithdrawMoney({ accountId, balance, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (!amount) {
      setError('Please enter amount');
      return;
    }

    if (parseFloat(amount) > balance) {
      setError('Insufficient balance');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      await API.post('/account/withdraw', {
        account_id: accountId,
        amount: parseFloat(amount)
      });

      setMessage('✅ Withdrawal successful!');
      setAmount('');
      onSuccess();

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="mb-4">🏧 Withdraw Money</h3>
      <div className="card shadow-sm">
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <div className="alert alert-info mb-3">
            <strong>Available Balance:</strong> ₹{balance.toFixed(2)}
          </div>

          <form onSubmit={handleWithdraw}>
            <div className="mb-3">
              <label className="form-label">Amount to Withdraw (₹)</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                step="100"
                min="0"
                max={balance}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-warning w-100" disabled={loading}>
              {loading ? '⏳ Processing...' : '💸 Withdraw'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BankDashboard;
