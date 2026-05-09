from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from config import Config

app = Flask(__name__)
CORS(app)

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


# ==========================================================
# ACCOUNT APIs
# ==========================================================

# Create Account
@app.route('/accounts', methods=['POST'])
def create_account():
    try:
        data = request.get_json()

        user_id = data['user_id']

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

        cursor.execute("""
            INSERT INTO accounts
            (
                user_id,
                account_number,
                IFSC_code,
                bank_name,
                account_type,
                branch,
                balance
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            data['user_id'],
            data['account_number'],
            data['IFSC_code'],
            data['bank_name'],
            data['account_type'],
            data['branch'],
            data['balance']
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


# Get All Accounts
@app.route('/accounts', methods=['GET'])
def get_all_accounts():
    try:
        cursor.execute("""
            SELECT
                account_id,
                user_id,
                account_number,
                IFSC_code,
                bank_name,
                account_type,
                branch,
                balance,
                created_at
            FROM accounts
        """)

        accounts = cursor.fetchall()

        return jsonify({
            "status": "success",
            "data": accounts
        }), 200

    except Exception as e:
        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500


# ==========================================================
# TRANSACTION APIs
# ==========================================================

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

            cursor.execute("""
                SELECT accounts.balance, users.name
                FROM accounts
                JOIN users
                ON accounts.user_id = users.user_id
                WHERE accounts.account_id = %s
            """, (account_id,))

            account = cursor.fetchone()

            if not account:
                return jsonify({
                    "status": "failure",
                    "message": "Account not found"
                }), 404

            new_balance = float(account['balance']) + amount

            cursor.execute("""
                UPDATE accounts
                SET balance = %s
                WHERE account_id = %s
            """, (
                new_balance,
                account_id
            ))

            cursor.execute("""
                INSERT INTO transactions
                (
                    account_id,
                    transaction_type,
                    amount,
                    balance_after_transaction,
                    sender_name,
                    receiver_name,
                    description
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                account_id,
                'DEPOSIT',
                amount,
                new_balance,
                'Self',
                account['name'],
                'Amount deposited successfully'
            ))

            db.commit()

            return jsonify({
                "status": "success",
                "message": "Amount deposited successfully",
                "data": {
                    "updated_balance": new_balance
                }
            }), 200

        # ==================================================
        # WITHDRAW
        # ==================================================
        elif transaction_type == 'WITHDRAW':

            account_id = data.get('account_id')

            cursor.execute("""
                SELECT accounts.balance, users.name
                FROM accounts
                JOIN users
                ON accounts.user_id = users.user_id
                WHERE accounts.account_id = %s
            """, (account_id,))

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

            cursor.execute("""
                UPDATE accounts
                SET balance = %s
                WHERE account_id = %s
            """, (
                new_balance,
                account_id
            ))

            cursor.execute("""
                INSERT INTO transactions
                (
                    account_id,
                    transaction_type,
                    amount,
                    balance_after_transaction,
                    sender_name,
                    receiver_name,
                    description
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                account_id,
                'WITHDRAW',
                amount,
                new_balance,
                account['name'],
                'Self',
                'Amount withdrawn successfully'
            ))

            db.commit()

            return jsonify({
                "status": "success",
                "message": "Amount withdrawn successfully",
                "data": {
                    "updated_balance": new_balance
                }
            }), 200

        # ==================================================
        # TRANSFER
        # ==================================================
        elif transaction_type == 'TRANSFER':

            from_account_id = data.get('from_account_id')
            to_account_id = data.get('to_account_id')

            # Sender
            cursor.execute("""
                SELECT accounts.balance, users.name
                FROM accounts
                JOIN users
                ON accounts.user_id = users.user_id
                WHERE accounts.account_id = %s
            """, (from_account_id,))

            sender = cursor.fetchone()

            # Receiver
            cursor.execute("""
                SELECT accounts.balance, users.name
                FROM accounts
                JOIN users
                ON accounts.user_id = users.user_id
                WHERE accounts.account_id = %s
            """, (to_account_id,))

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
            cursor.execute("""
                UPDATE accounts
                SET balance = %s
                WHERE account_id = %s
            """, (
                new_sender_balance,
                from_account_id
            ))

            # Update receiver balance
            cursor.execute("""
                UPDATE accounts
                SET balance = %s
                WHERE account_id = %s
            """, (
                new_receiver_balance,
                to_account_id
            ))

            # Sender transaction
            cursor.execute("""
                INSERT INTO transactions
                (
                    account_id,
                    transaction_type,
                    amount,
                    balance_after_transaction,
                    sender_name,
                    receiver_name,
                    description
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                from_account_id,
                'TRANSFER',
                amount,
                new_sender_balance,
                sender['name'],
                receiver['name'],
                f'Transferred to {receiver["name"]}'
            ))

            # Receiver transaction
            cursor.execute("""
                INSERT INTO transactions
                (
                    account_id,
                    transaction_type,
                    amount,
                    balance_after_transaction,
                    sender_name,
                    receiver_name,
                    description
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                to_account_id,
                'DEPOSIT',
                amount,
                new_receiver_balance,
                sender['name'],
                receiver['name'],
                f'Received from {sender["name"]}'
            ))

            db.commit()

            return jsonify({
                "status": "success",
                "message": "Funds transferred successfully"
            }), 200

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
            SELECT
                transaction_id,
                transaction_type,
                amount,
                balance_after_transaction,
                sender_name,
                receiver_name,
                description,
                created_at
            FROM transactions
            WHERE account_id = %s
            ORDER BY created_at DESC
        """, (account_id,))

        transactions = cursor.fetchall()

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