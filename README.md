# Bank Management System


## Live Application

🔗 **Live Demo:** http://3.216.107.106

## Project Overview

The Bank Management System is a full-stack web application designed for secure banking operations. It features a React-based frontend, a Python Flask backend, and a MySQL database for authentication, account management, and transaction processing.

Users can register, log in, manage bank accounts, deposit and withdraw money, transfer funds, and view transaction history through a modern and responsive interface.


## System Architecture

```text
React Frontend
  │
  │ REST API
  ▼
Flask Backend
  │
  ▼
MySQL Database
       │
       └── Hosted on AWS EC2
---

## Tech Stack

### Frontend
- React.js
- JavaScript
- CSS
- Axios
- React Router

### Backend
- Python
- Flask
- REST API
- JWT Authentication
- bcrypt

### Database
- MySQL

### Deployment
- AWS EC2
- Nginx
- Gunicorn


## Features

- **User Registration & Authentication:** Register and log in securely using JWT authentication and bcrypt password hashing.
- **Account Management:** Create, view, update, and manage multiple bank account details.
- **Deposit & Withdrawal:** Secure money transactions with instant balance updates and validation.
- **Fund Transfer:**Transfer funds between accounts with account validation, balance validation, and error handling.
- **Transaction History:** View detailed logs and records of all financial activities.
- **Balance Inquiry:** Check account balance in real-time from the dashboard.
- **Profile Management:** Update user profile information and manage account settings.
- **Password Recovery:** Reset the account password through the forgot password functionality.
- **Input Validation & Security:** Ensures data integrity, prevents unauthorized access, and secure transactions.


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
    MYSQL_DB = "bank_db"
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

## AWS Deployment

The application is deployed on an AWS EC2 instance.

- **EC2:** Application hosting
- **Nginx:** Frontend serving and API reverse proxy
- **Gunicorn:** Flask application server
- **MySQL:** Database
- **Elastic IP:** Stable public access



