import { useState, useEffect } from "react";
import API from "../services/api";

function FeeStatus({ userId: propUserId }) {
  // Get userId from props or localStorage
  const [userId, setUserId] = useState(propUserId || localStorage.getItem("user_id"));
  const [feeStatus, setFeeStatus] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [amountPaying, setAmountPaying] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchFeeStatus();
      fetchPaymentHistory();
    }
  }, [userId]);

  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchFeeStatus = async () => {
    try {
      const res = await API.get(`/student/${userId}/fee-status`);
      setFeeStatus(res.data);
      setError("");
    } catch (err) {
      setError("Failed to load fee status");
      console.error(err);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const res = await API.get(`/student/${userId}/payment-history`);
      setPaymentHistory(res.data);
    } catch (err) {
      setError("Failed to load payment history");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <span className="badge bg-success">✓ Paid</span>;
      case "pending":
        return <span className="badge bg-warning text-dark">⏱ Pending</span>;
      case "overdue":
        return <span className="badge bg-danger">⚠ Overdue</span>;
      default:
        // Default to paid for completed payment history entries
        return <span className="badge bg-success">✓ Paid</span>;
    }
  };

  const handlePaymentClick = (semester, amount) => {
    setSelectedSemester(semester);
    setAmountPaying(amount);
  };

  const initiatePayment = async () => {
    console.log("=== PAYMENT INITIATED ===");
    console.log("userId:", userId);
    console.log("selectedSemester:", selectedSemester);
    console.log("amountPaying:", amountPaying);

    if (!userId) {
      setError("User ID not found. Please login again.");
      return;
    }

    if (!amountPaying || amountPaying <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setProcessing(true);
      console.log("Sending payment request to backend...");
      
      const payload = {
        semester: selectedSemester,
        amount_paid: parseFloat(amountPaying)
      };
      console.log("Payload:", payload);

      const res = await API.post(`/student/${userId}/pay`, payload);
      
      console.log("=== PAYMENT RESPONSE RECEIVED ===");
      console.log("Response data:", res.data);

      // Redirect to bank payment portal
      if (res.data && res.data.payment_url) {
        console.log("Redirecting to:", res.data.payment_url);
        window.location.href = res.data.payment_url;
      } else {
        console.error("No payment_url in response");
        setError("Payment redirect URL not received from server");
      }
    } catch (err) {
      console.error("=== PAYMENT ERROR ===");
      console.error("Error object:", err);
      console.error("Error response:", err.response);
      setError(err.response?.data?.message || "Payment initiation failed: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="text-center"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div>
      {/* Fee Status Card */}
      <div className="card shadow mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">📊 Fee Status Summary</h5>
        </div>
        <div className="card-body">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError("")}></button>
            </div>
          )}

          {feeStatus ? (
            <div className="row">
              <div className="col-md-4">
                <div className="alert alert-info">
                  <strong>Total Fee:</strong> ₹{(parseFloat(feeStatus.total_fee) || 0).toFixed(2)}
                </div>
              </div>
              <div className="col-md-4">
                <div className="alert alert-success">
                  <strong>Amount Paid:</strong> ₹{(parseFloat(feeStatus.amount_paid) || 0).toFixed(2)}
                </div>
              </div>
              <div className="col-md-4">
                <div className={`alert ${parseFloat(feeStatus.net_payable) > 0 ? 'alert-warning' : 'alert-success'}`}>
                  <strong>Net Payable:</strong> ₹{(parseFloat(feeStatus.net_payable) || 0).toFixed(2)}
                  {parseFloat(feeStatus.net_payable) > 0 && (
                    <small className="d-block mt-2 text-muted">
                      💡 Select a semester below to pay its fee
                    </small>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted">No fee information available</p>
          )}
        </div>
      </div>

      {/* Semester-wise Fee Details */}
      <div className="card shadow mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">📋 Current-sem Fee Details</h5>
        </div>
        <div className="card-body">
          {feeStatus?.semesters && feeStatus.semesters.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Semester</th>
                    <th>Fee Amount</th>
                    <th>Paid Amount</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {feeStatus.semesters.map((sem, index) => {
                    const feeAmt = parseFloat(sem.fee_amount) || 0;
                    const paidAmt = parseFloat(sem.paid_amount) || 0;
                    const balance = feeAmt - paidAmt;
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td><strong>Sem {sem.semester}</strong></td>
                        <td>₹{feeAmt.toFixed(2)}</td>
                        <td>₹{paidAmt.toFixed(2)}</td>
                        <td>
                          <span className={balance > 0 ? "text-danger fw-bold" : "text-success"}>
                            ₹{balance.toFixed(2)}
                          </span>
                        </td>
                        <td>{getStatusBadge(sem.status)}</td>
                        <td>
                          {balance > 0 ? (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                setSelectedSemester(sem.semester);
                                setAmountPaying(balance);
                              }}
                              data-bs-toggle="modal"
                              data-bs-target="#paymentModal"
                            >
                              Pay Now
                            </button>
                          ) : (
                            <span className="badge bg-success">✓ Paid</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">No semester fee information available</p>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">💳 Payment History</h5>
        </div>
        <div className="card-body">
          {paymentHistory && paymentHistory.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Semester</th>
                    <th>Amount Paid</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </td>
                      <td>Sem {payment.semester}</td>
                      <td className="text-success">
                        <strong>₹{(parseFloat(payment.amount_paid) || 0).toFixed(2)}</strong>
                      </td>
                      <td>
                        <span className="badge bg-info">{payment.payment_method || "Bank Transfer"}</span>
                      </td>
                      <td>{getStatusBadge(payment.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted text-center py-3">No payment history found</p>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <div
        className="modal fade"
        id="paymentModal"
        tabIndex="-1"
        aria-labelledby="paymentModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title" id="paymentModalLabel">
                Initiate Payment
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Semester Number</label>
                <input
                  type="number"
                  className="form-control"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(parseInt(e.target.value) || "")}
                  placeholder="Enter semester number (1, 2, 3, etc.)"
                  min="1"
                  max="8"
                  disabled={processing}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Amount to Pay (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={amountPaying}
                  onChange={(e) => setAmountPaying(e.target.value)}
                  placeholder="Enter amount"
                  min="0"
                  step="100"
                  disabled={processing}
                />
              </div>
              <div className="alert alert-info">
                <small>
                  You will be redirected to the bank payment portal to complete the transaction securely.
                </small>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={initiatePayment}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </>
                ) : (
                  "Proceed to Payment"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeeStatus;
