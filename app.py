from flask import Flask, request, jsonify
import mysql.connector
from config import Config

app = Flask(__name__)

# Database Connection
db = mysql.connector.connect(
    host=Config.MYSQL_HOST,
    user=Config.MYSQL_USER,
    password=Config.MYSQL_PASSWORD,
    database=Config.MYSQL_DB
)

cursor = db.cursor(dictionary=True)

# ==========================================================
# USER APIs
# ==========================================================

# Create User
@app.route('/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()

        cursor.execute(
            "SELECT * FROM users WHERE email=%s",
            (data['email'],)
        )

        if cursor.fetchone():
            return jsonify({
                "status": "failure",
                "message": "Email already exists"
            }), 400

        cursor.execute("""
            INSERT INTO users(name, email, password, phone)
            VALUES(%s, %s, %s, %s)
        """, (
            data['name'],
            data['email'],
            data['password'],
            data['phone']
        ))

        db.commit()

        return jsonify({
            "status": "success",
            "message": "User created successfully",
            "data": {
                "user_id": cursor.lastrowid
            }
        }), 201

    except Exception as e:
        db.rollback()
        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500


# Login User
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        cursor.execute("""
            SELECT * FROM users
            WHERE email=%s AND password=%s
        """, (
            data['email'],
            data['password']
        ))

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "status": "failure",
                "message": "Invalid email or password"
            }), 401

        return jsonify({
            "status": "success",
            "message": "Login successful",
            "data": {
                "user_id": user['user_id'],
                "name": user['name']
            }
        }), 200

    except Exception as e:
        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500


# Get All Users
@app.route('/users', methods=['GET'])
def get_all_users():
    try:
        cursor.execute("""
            SELECT user_id, name, email, phone
            FROM users
        """)

        users = cursor.fetchall()

        if not users:
            return jsonify({
                "status": "failure",
                "message": "No users found"
            }), 404

        return jsonify({
            "status": "success",
            "message": "Users retrieved successfully",
            "data": users
        }), 200

    except Exception as e:
        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500


# Get User By ID
@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        cursor.execute("""
            SELECT user_id, name, email, phone
            FROM users
            WHERE user_id=%s
        """, (user_id,))

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "status": "failure",
                "message": "User not found"
            }), 404

        return jsonify({
            "status": "success",
            "message": "User retrieved successfully",
            "data": user
        }), 200

    except Exception as e:
        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500


# Update User
@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        data = request.get_json()

        cursor.execute(
            "SELECT * FROM users WHERE user_id=%s",
            (user_id,)
        )

        if not cursor.fetchone():
            return jsonify({
                "status": "failure",
                "message": "User not found"
            }), 404

        cursor.execute("""
            UPDATE users
            SET name=%s, email=%s, phone=%s
            WHERE user_id=%s
        """, (
            data['name'],
            data['email'],
            data['phone'],
            user_id
        ))

        db.commit()

        return jsonify({
            "status": "success",
            "message": "User updated successfully"
        }), 200

    except Exception as e:
        db.rollback()
        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500


# Delete User
@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        cursor.execute(
            "SELECT * FROM users WHERE user_id=%s",
            (user_id,)
        )

        if not cursor.fetchone():
            return jsonify({
                "status": "failure",
                "message": "User not found"
            }), 404

        cursor.execute(
            "DELETE FROM users WHERE user_id=%s",
            (user_id,)
        )

        db.commit()

        return jsonify({
            "status": "success",
            "message": "User deleted successfully"
        }), 200

    except Exception as e:
        db.rollback()
        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500
# ==========================================================
# ACCOUNT APIs (UPDATED FIXED VERSION)
# ==========================================================

# Create Account
@app.route('/accounts', methods=['POST'])
def create_account():
    try:
        data = request.get_json()

        user_id = data['user_id']
        account_number = data['account_number']
        ifsc_code = data['IFSC_code']
        bank_name = data['bank_name']
        account_type = data['account_type']
        branch = data['branch']
        balance = data['balance']

        # Check user exists
        cursor.execute(
            "SELECT * FROM users WHERE user_id = %s",
            (user_id,)
        )
        user = cursor.fetchone()

        if not user:
            return jsonify({
                "status": "failure",
                "message": "User not found"
            }), 404

        # Create account
        cursor.execute("""
            INSERT INTO accounts
            (user_id, account_number, IFSC_code, bank_name,
             account_type, branch, balance)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id,
            account_number,
            ifsc_code,
            bank_name,
            account_type,
            branch,
            balance
        ))

        db.commit()

        return jsonify({
            "status": "success",
            "message": "Account created successfully",
            "data": {
                "account_id": cursor.lastrowid
            }
        }), 201

    except Exception as e:
        db.rollback()
        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500


# ==========================================================
# Get All Accounts
# ==========================================================
@app.route('/accounts', methods=['GET'])
def get_all_accounts():
    try:
        cursor.execute("""
            SELECT account_id, user_id, account_number,
                   IFSC_code, bank_name, account_type,
                   branch, balance, created_at
            FROM accounts
        """)

        accounts = cursor.fetchall()

        if not accounts:
            return jsonify({
                "status": "failure",
                "message": "No accounts found"
            }), 404

        return jsonify({
            "status": "success",
            "message": "Accounts retrieved successfully",
            "data": accounts
        }), 200

    except Exception as e:
        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500


# ==========================================================
# Get Account By ID
# ==========================================================
@app.route('/accounts/<int:account_id>', methods=['GET'])
def get_account_by_id(account_id):
    try:
        cursor.execute("""
            SELECT account_id, user_id, account_number,
                   IFSC_code, bank_name, account_type,
                   branch, balance, created_at
            FROM accounts
            WHERE account_id = %s
        """, (account_id,))

        account = cursor.fetchone()

        if not account:
            return jsonify({
                "status": "failure",
                "message": "Account not found"
            }), 404

        return jsonify({
            "status": "success",
            "message": "Account retrieved successfully",
            "data": account
        }), 200

    except Exception as e:
        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500


# ==========================================================
# Delete Account
# ==========================================================
@app.route('/accounts/<int:account_id>', methods=['DELETE'])
def delete_account(account_id):
    try:
        cursor.execute(
            "SELECT * FROM accounts WHERE account_id = %s",
            (account_id,)
        )

        account = cursor.fetchone()

        if not account:
            return jsonify({
                "status": "failure",
                "message": "Account not found"
            }), 404

        cursor.execute(
            "DELETE FROM accounts WHERE account_id = %s",
            (account_id,)
        )

        db.commit()

        return jsonify({
            "status": "success",
            "message": "Account deleted successfully"
        }), 200

    except Exception as e:
        db.rollback()
        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500
 # ==========================================================
# TRANSACTION APIs
# ==========================================================

# Deposit / Withdraw / Transfer
@app.route('/transactions', methods=['POST'])
def perform_transaction():
    try:
        data = request.get_json()

        transaction_type = data.get('transaction_type')
        amount = float(data.get('amount', 0))

        # ==================================================
        # DEPOSIT
        # ==================================================
        if transaction_type == 'DEPOSIT':
            account_id = data.get('account_id')

            cursor.execute(
                "SELECT balance FROM accounts WHERE account_id = %s",
                (account_id,)
            )
            account = cursor.fetchone()

            if not account:
                return jsonify({
                    "status": "failure",
                    "message": "Account not found"
                }), 404

            new_balance = float(account['balance']) + amount

            cursor.execute(
                "UPDATE accounts SET balance = %s WHERE account_id = %s",
                (new_balance, account_id)
            )

            cursor.execute("""
                INSERT INTO transactions
                (account_id, transaction_type, amount,
                 balance_after_transaction, description)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                account_id,
                'DEPOSIT',
                amount,
                new_balance,
                'Amount deposited successfully'
            ))

            db.commit()

            return jsonify({
                "status": "success",
                "message": "Amount deposited successfully",
                "data": {
                    "account_id": account_id,
                    "updated_balance": new_balance
                }
            }), 200

        # ==================================================
        # WITHDRAW
        # ==================================================
        elif transaction_type == 'WITHDRAW':
            account_id = data.get('account_id')

            cursor.execute(
                "SELECT balance FROM accounts WHERE account_id = %s",
                (account_id,)
            )
            account = cursor.fetchone()

            if not account:
                return jsonify({
                    "status": "failure",
                    "message": "Account not found"
                }), 404

            current_balance = float(account['balance'])

            if current_balance < amount:
                return jsonify({
                    "status": "failure",
                    "message": "Insufficient balance"
                }), 400

            new_balance = current_balance - amount

            cursor.execute(
                "UPDATE accounts SET balance = %s WHERE account_id = %s",
                (new_balance, account_id)
            )

            cursor.execute("""
                INSERT INTO transactions
                (account_id, transaction_type, amount,
                 balance_after_transaction, description)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                account_id,
                'WITHDRAW',
                amount,
                new_balance,
                'Amount withdrawn successfully'
            ))

            db.commit()

            return jsonify({
                "status": "success",
                "message": "Amount withdrawn successfully",
                "data": {
                    "account_id": account_id,
                    "updated_balance": new_balance
                }
            }), 200

        # ==================================================
        # TRANSFER
        # ==================================================
        elif transaction_type == 'TRANSFER':
            from_account_id = data.get('from_account_id')
            to_account_id = data.get('to_account_id')

            cursor.execute(
                "SELECT balance FROM accounts WHERE account_id = %s",
                (from_account_id,)
            )
            sender = cursor.fetchone()

            cursor.execute(
                "SELECT balance FROM accounts WHERE account_id = %s",
                (to_account_id,)
            )
            receiver = cursor.fetchone()

            if not sender or not receiver:
                return jsonify({
                    "status": "failure",
                    "message": "Invalid account"
                }), 404

            sender_balance = float(sender['balance'])

            if sender_balance < amount:
                return jsonify({
                    "status": "failure",
                    "message": "Insufficient balance"
                }), 400

            new_sender_balance = sender_balance - amount
            new_receiver_balance = float(receiver['balance']) + amount

            # Update sender balance
            cursor.execute(
                "UPDATE accounts SET balance = %s WHERE account_id = %s",
                (new_sender_balance, from_account_id)
            )

            # Update receiver balance
            cursor.execute(
                "UPDATE accounts SET balance = %s WHERE account_id = %s",
                (new_receiver_balance, to_account_id)
            )

            # Sender transaction
            cursor.execute("""
                INSERT INTO transactions
                (account_id, transaction_type, amount,
                 balance_after_transaction, description)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                from_account_id,
                'TRANSFER',
                amount,
                new_sender_balance,
                f'Transferred to Account {to_account_id}'
            ))

            # Receiver transaction
            cursor.execute("""
                INSERT INTO transactions
                (account_id, transaction_type, amount,
                 balance_after_transaction, description)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                to_account_id,
                'DEPOSIT',
                amount,
                new_receiver_balance,
                f'Received from Account {from_account_id}'
            ))

            db.commit()

            return jsonify({
                "status": "success",
                "message": "Funds transferred successfully",
                "data": {
                    "from_account_id": from_account_id,
                    "to_account_id": to_account_id,
                    "amount": amount
                }
            }), 200

        # ==================================================
        # INVALID TYPE
        # ==================================================
        else:
            return jsonify({
                "status": "failure",
                "message": "Invalid transaction type"
            }), 400

    except Exception as e:
        db.rollback()
        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500


# ==========================================================
# GET TRANSACTION HISTORY
# ==========================================================
@app.route('/transactions/<int:account_id>', methods=['GET'])
def get_transaction_history(account_id):
    try:
        cursor.execute("""
            SELECT transaction_id,
                   transaction_type,
                   amount,
                   balance_after_transaction,
                   description,
                   created_at
            FROM transactions
            WHERE account_id = %s
            ORDER BY created_at DESC
        """, (account_id,))

        transactions = cursor.fetchall()

        if not transactions:
            return jsonify({
                "status": "failure",
                "message": "No transactions found"
            }), 404

        return jsonify({
            "status": "success",
            "message": "Transaction history retrieved successfully",
            "data": transactions
        }), 200

    except Exception as e:
        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500   
    


if __name__ == '__main__':
    app.run(debug=True)