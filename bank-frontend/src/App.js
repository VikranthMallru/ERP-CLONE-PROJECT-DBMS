import { useState, useEffect } from 'react';
import BankLogin from './components/BankLogin';
import BankSignup from './components/BankSignup';
import BankDashboard from './components/BankDashboard';
import PaymentConfirm from './components/PaymentConfirm';
import PaymentSuccess from './components/PaymentSuccess';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [loggedInEmail, setLoggedInEmail] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    // Check if redirected from EIMS payment
    const params = new URLSearchParams(window.location.search);
    const studentId = params.get('student_id');
    const semester = params.get('semester');
    const amount = params.get('amount');

    if (studentId && amount) {
      // Payment redirect from EIMS - store payment data
      setPaymentData({
        student_id: studentId,
        semester: semester,
        amount: parseFloat(amount)
      });
      
      // Check if already logged in
      const savedEmail = localStorage.getItem('bank_email');
      if (savedEmail) {
        setLoggedInEmail(savedEmail);
        setCurrentPage('confirm');
      } else {
        // Not logged in, go to login first
        setCurrentPage('login');
      }
    }

    // Auto redirect to success after payment
    if (window.location.pathname.includes('payment-success')) {
      setCurrentPage('success');
    }
  }, []);

  const handleLoginSuccess = (email) => {
    setLoggedInEmail(email);
    localStorage.setItem('bank_email', email);
    
    // If payment data exists, go to payment confirm
    if (paymentData) {
      setCurrentPage('confirm');
    } else {
      // Otherwise, go to dashboard
      setCurrentPage('dashboard');
    }
  };

  const handleSignupSuccess = () => {
    setCurrentPage('login');
  };

  const handlePaymentSuccess = () => {
    setCurrentPage('success');
    localStorage.removeItem('bank_email');
    // Auto redirect after 3 seconds
    setTimeout(() => {
      window.location.href = `${process.env.REACT_APP_EIMS_URL || 'http://localhost:3000'}/student/payment-success`;
    }, 3000);
  };

  const handleLogout = () => {
    setLoggedInEmail(null);
    setCurrentPage('login');
    setPaymentData(null);
    localStorage.removeItem('bank_email');
  };

  const handleBackToLogin = () => {
    setCurrentPage('login');
    setLoggedInEmail(null);
    localStorage.removeItem('bank_email');
  };

  return (
    <div className="app">
      {currentPage === 'login' && (
        <BankLogin 
          onLoginSuccess={handleLoginSuccess}
          onSignupClick={() => setCurrentPage('signup')}
        />
      )}
      {currentPage === 'signup' && (
        <BankSignup
          onSignupSuccess={handleSignupSuccess}
          onBackClick={handleBackToLogin}
        />
      )}
      {currentPage === 'dashboard' && (
        <BankDashboard
          accountEmail={loggedInEmail}
          onLogout={handleLogout}
        />
      )}
      {currentPage === 'confirm' && paymentData && (
        <PaymentConfirm
          accountId={loggedInEmail}
          paymentData={paymentData}
          onSuccess={handlePaymentSuccess}
          onBack={() => setCurrentPage('dashboard')}
        />
      )}
      {currentPage === 'success' && <PaymentSuccess />}
    </div>
  );
}

export default App;
