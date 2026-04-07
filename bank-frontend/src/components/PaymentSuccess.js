function PaymentSuccess() {
  const handleBackToEIMS = () => {
    window.location.href = `${process.env.REACT_APP_EIMS_URL || 'http://localhost:3000'}/student/payment-success`;
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow text-center" style={{ width: '100%', maxWidth: '450px' }}>
        <div className="card-body py-5">
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>
            ✅
          </div>

          <h3 className="card-title text-success mb-3">Payment Successful!</h3>

          <p className="card-text text-muted mb-4">
            Your payment has been processed successfully and your EIMS account has been updated.
          </p>

          <div className="alert alert-success mb-4">
            <p className="mb-0">
              You will be redirected to EIMS in a few seconds..
            </p>
          </div>

          <button
            className="btn btn-primary btn-lg w-100"
            onClick={handleBackToEIMS}
          >
            Back to EIMS
          </button>

          <p className="text-muted small mt-3">
            If not redirected automatically, click the button above.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
