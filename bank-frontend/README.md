# EIMS Bank Payment Portal

This is a React-based bank payment portal for the EIMS (Educational Institute Management System). It handles student fee payments through a secure authentication flow.

## Features

- 🔐 Bank account login with Account ID and PIN
- 💳 Payment confirmation with balance verification
- 📊 Real-time account balance display
- ✅ Payment success confirmation
- 🔄 Integration with EIMS backend

## Getting Started

### Prerequisites

- Node.js and npm installed
- EIMS Backend running on localhost:5000
- Bank Backend running on localhost:4000

### Installation

```bash
cd bank-frontend
npm install
```

### Running the Application

```bash
# Development mode (runs on port 4000)
npm run dev

# Or with regular start
npm start
```

The application will open at `http://localhost:4000`

## Payment Flow

1. **Login**: Student logs in with bank account ID and PIN
   - Demo Account: ACCT001
   - Demo PIN: 1111

2. **Confirmation**: Review payment details and account balance
   - Shows student ID, semester, payment amount
   - Verifies sufficient balance

3. **Processing**: Payment is processed and transferred to college account

4. **Success**: Payment confirmation and redirect to EIMS

## Components

- **BankLogin**: Login interface for bank account authentication
- **PaymentConfirm**: Payment confirmation and processing
- **PaymentSuccess**: Success message and redirect

## API Endpoints Used

- `GET /account/{accountId}/balance` - Get account balance
- `POST /account/transfer` - Process payment transfer
- `POST /student/payment-success` - Notify EIMS of successful payment

## Port Configuration

- Frontend: 4000 (Bank Portal)
- Backend: 4000 (Bank API)
- EIMS Frontend: 3000
- EIMS Backend: 5000
