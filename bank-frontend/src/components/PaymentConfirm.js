import { useState, useEffect } from 'react';
import API from '../services/api';

function PaymentConfirm({ accountId, paymentData, onSuccess, onBack }) {
  const [balance, setBalance] = useState(null);
  const [accountNumber, setAccountNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get customer account balance - using email as identifier
        const res = await API.get(`/customer/${accountId}/balance`);
        
        if (res.data) {
          setBalance(parseFloat(res.data.balance) || 0);
          setAccountNumber(res.data.account_id);
        }

        setError('');
      } catch (err) {
        setError('Failed to load account details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [accountId]);

  const handleConfirmPayment = async () => {
    if (!paymentData.amount || paymentData.amount <= 0) {
      setError('Invalid payment amount');
      return;
    }

    if (balance < paymentData.amount) {
      setError('Insufficient balance');
      return;
    }

    try {
      setProcessing(true);
      setError('');

      // Process payment
      const res = await API.post('/account/transfer', {
        from_account_id: accountNumber,
        to_account_id: 'COLLEGE_MAIN_ACCOUNT',
        amount: paymentData.amount,
        purpose: `Fee Payment - Student ${paymentData.student_id} - Semester ${paymentData.semester}`,
        student_id: paymentData.student_id,
        semester: paymentData.semester
      });

      if (res.status === 200) {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow" style={{ width: '100%', maxWidth: '450px' }}>
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">💳 Payment Confirmation</h5>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}

          <div className="alert alert-info">
            <strong>Account Details:</strong><br />
            Email: {accountId}<br />
            Available Balance: <strong>₹{(balance || 0).toFixed(2)}</strong>
          </div>

          <hr />

          <div className="mb-4">
            <h6 className="text-secondary">Payment Details</h6>
            
            <div className="row mb-3">
              <div className="col-6">
                <label className="form-label text-muted small">Student ID:</label>
                <p className="fw-bold">{paymentData.student_id}</p>
              </div>
              <div className="col-6">
                <label className="form-label text-muted small">Semester:</label>
                <p className="fw-bold">{paymentData.semester}</p>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-12">
                <label className="form-label text-muted small">Amount to Pay:</label>
                <p className="display-6 text-success fw-bold">₹{(paymentData.amount || 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="row">
              <div className="col-12">
                <label className="form-label text-muted small">Remaining After Payment:</label>
                <p className="text-primary fw-bold">₹{((balance || 0) - (paymentData.amount || 0)).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="alert alert-warning small mb-3">
            ⚠️ By confirming, you authorize this payment to EIMS. Once confirmed, this cannot be reversed.
          </div>

          <div className="d-grid gap-2">
            <button
              className="btn btn-success"
              onClick={handleConfirmPayment}
              disabled={processing || !balance || balance < paymentData.amount}
            >
              {processing ? '🔄 Processing...' : '✅ Confirm Payment'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={onBack}
              disabled={processing}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentConfirm;
