# Bank Management System

## Project Overview

The Bank Management System is a secure backend application built using Python, Flask, and MySQL. It allows users to create accounts, deposit, withdraw, transfer funds, and view transaction history through RESTful APIs. The system ensures secure authentication, accurate transactions, and reliable data management.

## Tech Stack

- **Framework:** Python, Flask
- **Database:** MySQL
- **Database Connector:** `mysql-connector-python` (if applicable)

## Features

- **User Registration & Authentication:** Secure signup and login with encrypted password handling.
- **Account Management:** Create, view, update, and manage bank account details.
- **Deposit & Withdrawal:** Secure money transactions with instant balance updates.
- **Fund Transfer:** Transfer money between accounts with validation.
- **Transaction History:** View detailed logs of all activities.
- **Balance Inquiry:** Check account balance in real time.
- **Input Validation & Security:** Ensures data integrity and secure transactions.

## Project Structure

```text
bank-management-system/
│
├── app.py                 # Main application file containing APIs
├── config.py              # Configuration and database settings
├── requirements.txt       # Dependencies needed to run the project
├── README.md              # Project documentation
└── .gitignore             # Standard git ignores for Python projects
```

## Setup Instructions

### 1. Prerequisites

- Python 3.8+
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

### 3. Running the Project Locally

1. Open a terminal in the project directory.
2. Create a virtual environment (optional but highly recommended):

    ```bash
    python -m venv venv

    # on Windows:
    venv\Scripts\activate
    
    # on Mac/Linux:
    source venv/bin/activate
    ```

3. Install dependencies:

    ```bash
    pip install -r requirements.txt
    ```

4. Run the Flask application:

    ```bash
    python app.py
    ```

5. The API will start running at `http://127.0.0.1:5000`.

## API Endpoints Summary

- `POST /users` - Create a new user
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
