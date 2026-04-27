# 🏦 Bank Management System

## 📌 Project Overview
The Bank Management System is a secure backend application built using **Python, Flask, and MySQL**.  
It allows users to create accounts, deposit, withdraw, transfer funds, and view transaction history through RESTful APIs.  
The system ensures **secure authentication, accurate transactions, and reliable data management**.

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript / ReactJS  
- **Backend:** Python  
- **Framework:** Flask  
- **Database:** MySQL  

---

## 🚀 Features

- **User Registration & Authentication:** Secure signup and login with encrypted password handling  
- **Account Management:** Create, view, update, and manage bank account details  
- **Deposit & Withdrawal:** Secure money transactions with instant balance updates  
- **Fund Transfer:** Transfer money between accounts with validation  
- **Transaction History:** View detailed logs of all activities  
- **Balance Inquiry:** Check account balance in real time  
- **Input Validation & Security:** Ensures data integrity and secure transactions  

---

## 📂 Project Structure

bank-management-system/
│
├── app.py
├── config.py
├── requirements.txt
├── README.md
└── .gitignore


---

## ⚙️ Setup Instructions

### 1️⃣ Prerequisites

- Python 3.8 or above  
- MySQL Server  

---

### 2️⃣ Database Setup

1. Create a MySQL database:
   ```sql
   CREATE DATABASE bank_db;
   USE bank_db;
   
2.Ensure required tables exist:users,accounts,transactions

3.Update database credentials in config.py:

MYSQL_HOST = "localhost"
MYSQL_USER = "root"
MYSQL_PASSWORD = "your_password"  # change this
MYSQL_DATABASE = "bank_db"

3️⃣ Run the Project
Open terminal in project directory

Create virtual environment:

python -m venv venv

Activate environment:

Windows:

venv\Scripts\activate

Mac/Linux:

source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Run Flask app:

python app.py

API will run at:

http://127.0.0.1:5000/
🧪 Testing with Postman
Download and install Postman
Ensure Flask server is running
Enter API URL: http://127.0.0.1:5000/
Select HTTP method (GET, POST, etc.)
For POST → Body → raw → JSON
Click Send
📌 API Endpoints Summary
👤 User APIs
POST /users → Create a new user
POST /login → User login authentication
GET /users → Fetch all users
GET /users/<user_id> → Get user details
PUT /users/<user_id> → Update user
DELETE /users/<user_id> → Delete user
🏦 Account APIs
POST /accounts → Create account
GET /accounts → Fetch all accounts
GET /accounts/<account_id> → Get account details
DELETE /accounts/<account_id> → Delete account
💳 Transaction APIs
POST /transactions → Deposit / Withdraw / Transfer
GET /transactions/<account_id> → Transaction history
