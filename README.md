 ##  Bank Management System

 ## Project Overview
The Bank Management System is a secure backend application built using Python, Flask, and MySQL. It allows users to create accounts, deposit, withdraw, transfer funds, and view transaction history through RESTful APIs. The system ensures secure authentication, accurate transactions, and reliable data management.

## Tech Stack

•Frontend:HTML,CSS,JS/ReactJS     
•Backend: Python
•Framework: Flask
•Database: MySQL

## Features
•User Registration & Authentication: Secure user signup and login with encrypted password  handling.
•Account Management:Create, view, update, and manage bank account details.
•Deposit & Withdrawal:Perform secure money deposits and withdrawals with instant balance updates.
•Fund Transfer:Transfer money between accounts with proper transaction validation. 
•Transaction History: View detailed transaction logs for all account activities.
•Balance Inquiry: Check current account balance in real time.
•Input Validation & Security: Ensures data integrity, secure transactions, and robust error handling.     

## 📂 Project Structure

bank-management-system/
│
├── app.py
├── config.py
├── requirements.txt
├── README.md
└── .gitignore

##  Setup Instructions

## 1. Prerequisites

•Python 3.8 or above
•MySQL Server


## 2. Database Setup

1. Create a MySQL database named `bank_db`.
CREATE DATABASE bank_db;
USE bank_db;
2.Ensure you have the required tables set up:
users
accounts
transactions
3.Update the database credentials in config.py to match your local MySQL setup:
MYSQL_HOST = "localhost"
MYSQL_USER = "root"
MYSQL_PASSWORD = "your_password"     #change this to your password
MYSQL_DATABASE = "bank_db"

## 3. Running the Project Locally

1.Open a terminal in the project directory.
2.Create a virtual environment(optional but highly recommended):
python -m venv venv

# on Windows:
venv\Scripts\activate
# on mac/Linux:
source venv/bin/activate

3.Install dependencies:
pip install -r requirements.txt

4.Run the Flask application:
python app.py

5.The API will be available at:http://127.0.0.1:5000.

## 🧪 Testing with Postman

1. Download and install Postman.
2. Ensure the Flask server is running.
3. Enter the API URL :http://127.0.0.1:5000/`.
4. Select the HTTP method (`GET`, `POST`, etc.).
5. For POST requests, go to **Body → raw → JSON** and enter the request data.
6. Click **Send** to view the response.


📌 API Endpoints Summary

👤 USER APIs
•POST /users → Create a new user
•POST /login → User login authentication
•GET /users → Fetch all users
•GET /users/<user_id> → Get user details by ID
•PUT /users/<user_id> → Update user information
•DELETE /users/<user_id> → Delete a user

🏦 ACCOUNT APIs
•POST /accounts → Create a new bank account
•GET /accounts → Fetch all accounts
•GET /accounts/<account_id> → Get account details by ID
•DELETE /accounts/<account_id> → Delete a bank account

💳 TRANSACTION APIs
•POST /transactions → Deposit / Withdraw / Transfer money
•GET /transactions/<account_id> → Fetch transaction history of an account