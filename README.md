# Bank Management System

## Project Overview

The Bank Management System is a full-stack web application designed for secure banking operations. It features a React-based frontend for user interactions and a Python Flask backend with MySQL database for secure authentication, transaction management, and account operations. Users can register, login, deposit, withdraw, transfer funds, and view transaction history with a modern, responsive interface.

## Tech Stack

### Backend
- **Framework:** Python, Flask
- **Database:** MySQL
- **Database Connector:** `mysql-connector-python`

### Frontend
- **Framework:** React
- **Styling:** CSS
- **Package Manager:** npm

## Features

- **User Registration & Authentication:** Secure signup and login with encrypted password handling and session management.
- **Account Management:** Create, view, update, and manage multiple bank account details.
- **Deposit & Withdrawal:** Secure money transactions with instant balance updates and validation.
- **Fund Transfer:** Transfer money between accounts with comprehensive validation and error handling.
- **Transaction History:** View detailed logs and records of all financial activities.
- **Balance Inquiry:** Check account balance in real-time from the dashboard.
- **Profile Management:** Update user profile information and manage account settings.
- **Password Recovery:** Forgot password functionality to help users regain access.
- **Input Validation & Security:** Ensures data integrity, prevents unauthorized access, and secure transactions.
- **Responsive UI:** Modern React-based frontend with responsive design for desktop and mobile devices.

## Project Structure

```text
bank-management-system/
│
├── app.py                 # Main Flask application with API endpoints
├── config.py              # Configuration and database settings
├── migrate_passwords.py   # Utility for password migration/management
├── requirements.txt       # Python dependencies
├── package.json           # Root npm package configuration
├── README.md              # Project documentation
│
└── frontend/              # React frontend application
    ├── package.json       # Frontend dependencies
    ├── public/
    │   ├── index.html
    │   ├── manifest.json
    │   └── robots.txt
    └── src/
        ├── App.js         # Main React application component
        ├── index.js       # Application entry point
        ├── index.css      # Global styles
        ├── components/    # Reusable React components
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Dashboard.js
        │   ├── Accounts.js
        │   ├── Deposit.js
        │   ├── Withdraw.js
        │   ├── Transfer.js
        │   ├── TransferSuccess.js
        │   ├── Transactions.js
        │   ├── Profile.js
        │   ├── ForgotPassword.js
        │   └── *.css      # Component-specific styles
        └── services/
            └── api.js     # API service for backend communication
```

## Setup Instructions

### 1. Prerequisites

- Python 3.8+
- Node.js 14+ and npm
- MySQL Server

### 2. Database Setup

1. Create a MySQL database named `bank_db`.
2. Ensure you have the `users`, `accounts`, and `transactions` tables set up.
3. Update the database credentials in `config.py` to match your local MySQL setup:

    ```python
    MYSQL_HOST = "localhost"
    MYSQL_USER = "root"
    MYSQL_PASSWORD = "your_password"     # Change this to your local MySQL password
    MYSQL_DATABASE = "bank_db"
    ```

### 3. Backend Setup

1. Open a terminal in the project root directory.
2. Create a Python virtual environment:

    ```bash
    python -m venv venv

    # on Windows:
    venv\Scripts\activate
    
    # on Mac/Linux:
    source venv/bin/activate
    ```

3. Install Python dependencies:

    ```bash
    pip install -r requirements.txt
    ```

4. Run the Flask backend server:

    ```bash
    python app.py
    ```

5. The backend API will start running at `http://127.0.0.1:5000`.

### 4. Frontend Setup

1. Navigate to the frontend directory:

    ```bash
    cd frontend
    ```

2. Install frontend dependencies:

    ```bash
    npm install
    ```

3. Start the React development server:

    ```bash
    npm start
    ```

4. The frontend will open at `http://localhost:3000`.

### 5. Running the Complete Application

- **Backend:** Running on `http://127.0.0.1:5000`
- **Frontend:** Running on `http://localhost:3000`

Both the frontend and backend need to run simultaneously for the application to work properly.

## API Endpoints Summary

- `POST /users` - Create a new user (registration)
- `POST /login` - User login authentication
- `GET /users` - Fetch all users
- `GET /users/<user_id>` - Get user details by ID
- `PUT /users/<user_id>` - Update user information
- `DELETE /users/<user_id>` - Delete a user
- `POST /accounts` - Create a new bank account
- `GET /accounts` - Fetch all accounts
- `GET /accounts/<account_id>` - Get account details by ID
- `DELETE /accounts/<account_id>` - Delete a bank account
- `POST /transactions` - Deposit / Withdraw / Transfer money
- `GET /transactions/<account_id>` - Fetch transaction history of an account

## Security Considerations

- **Password Encryption:** All passwords are encrypted before storage in the database.
- **Session Management:** Secure session handling to prevent unauthorized access.
- **Input Validation:** All user inputs are validated to prevent SQL injection and XSS attacks.
- **CORS Configuration:** Configure CORS settings appropriately for frontend-backend communication.
- **Database Credentials:** Keep database credentials secure and never commit them to version control.

## Troubleshooting

### Backend Issues
- Ensure MySQL server is running and `bank_db` database exists.
- Verify database credentials in `config.py` match your MySQL setup.
- Check that all Python dependencies are installed: `pip install -r requirements.txt`

### Frontend Issues
- Ensure Node.js and npm are installed correctly.
- Clear npm cache if dependency issues occur: `npm cache clean --force`
- Check that the backend is running on `http://127.0.0.1:5000` before starting the frontend.
- Verify CORS is properly configured in the Flask backend.

