from functools import wraps

from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from config import Config
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone

app = Flask(__name__)
CORS(app)


# ==========================================================
# DATABASE CONNECTION
# ==========================================================

db = mysql.connector.connect(
    host=Config.MYSQL_HOST,
    user=Config.MYSQL_USER,
    password=Config.MYSQL_PASSWORD,
    database=Config.MYSQL_DB
)

cursor = db.cursor(dictionary=True)


# ==========================================================
# JWT SETTINGS
# ==========================================================

JWT_SECRET_KEY = getattr(
    Config,
    "JWT_SECRET_KEY",
    "bank-management-secret-key"
)

JWT_ALGORITHM = getattr(
    Config,
    "JWT_ALGORITHM",
    "HS256"
)

JWT_EXPIRATION_HOURS = getattr(
    Config,
    "JWT_EXPIRATION_HOURS",
    24
)


# ==========================================================
# JWT AUTHENTICATION
# ==========================================================

def token_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({
                "status": "failure",
                "message": "Authorization token is required"
            }), 401

        parts = auth_header.split()

        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({
                "status": "failure",
                "message": "Invalid authorization header"
            }), 401

        token = parts[1]

        try:

            decoded_token = jwt.decode(
                token,
                JWT_SECRET_KEY,
                algorithms=[JWT_ALGORITHM]
            )

            request.user = decoded_token

        except jwt.ExpiredSignatureError:

            return jsonify({
                "status": "failure",
                "message": "Token has expired"
            }), 401

        except jwt.InvalidTokenError:

            return jsonify({
                "status": "failure",
                "message": "Invalid token"
            }), 401

        return f(*args, **kwargs)

    return decorated


# ==========================================================
# USER APIs
# ==========================================================


# ----------------------------------------------------------
# CREATE USER
# ----------------------------------------------------------

@app.route('/users', methods=['POST'])
def create_user():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "status": "failure",
                "message": "User data is required"
            }), 400

        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        phone = data.get('phone')

        if not name or not email or not password or not phone:
            return jsonify({
                "status": "failure",
                "message": "All user details are required"
            }), 400

        cursor.execute(
            "SELECT user_id FROM users WHERE email=%s",
            (email,)
        )

        if cursor.fetchone():
            return jsonify({
                "status": "failure",
                "message": "Email already exists"
            }), 400

        password_hash = bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        cursor.execute("""
            INSERT INTO users
            (
                name,
                email,
                password,
                phone
            )
            VALUES (%s, %s, %s, %s)
        """, (
            name,
            email,
            password_hash,
            phone
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


# ----------------------------------------------------------
# GET ALL USERS
# ----------------------------------------------------------

@app.route('/users', methods=['GET'])
@token_required
def get_all_users():

    try:

        cursor.execute("""
            SELECT
                user_id,
                name,
                email,
                phone
            FROM users
        """)

        users = cursor.fetchall()

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


# ----------------------------------------------------------
# GET USER BY ID
# ----------------------------------------------------------

@app.route('/users/<int:user_id>', methods=['GET'])
@token_required
def get_user_by_id(user_id):

    try:

        logged_in_user_id = request.user['user_id']

        if int(user_id) != int(logged_in_user_id):
            return jsonify({
                "status": "failure",
                "message": "You can view only your own profile"
            }), 403

        cursor.execute("""
            SELECT
                user_id,
                name,
                email,
                phone
            FROM users
            WHERE user_id = %s
        """, (user_id,))

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "status": "failure",
                "message": "User not found"
            }), 404

        return jsonify({
            "status": "success",
            "message": "User details retrieved successfully",
            "data": user
        }), 200

    except Exception as e:

        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500


# ----------------------------------------------------------
# UPDATE USER
# ----------------------------------------------------------

@app.route('/users/<int:user_id>', methods=['PUT'])
@token_required
def update_user(user_id):

    try:

        logged_in_user_id = request.user['user_id']

        if int(user_id) != int(logged_in_user_id):
            return jsonify({
                "status": "failure",
                "message": "You can update only your own profile"
            }), 403

        data = request.get_json()

        name = data.get('name')
        phone = data.get('phone')

        if not name or not phone:
            return jsonify({
                "status": "failure",
                "message": "Name and phone are required"
            }), 400

        cursor.execute("""
            SELECT user_id
            FROM users
            WHERE user_id = %s
        """, (user_id,))

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "status": "failure",
                "message": "User not found"
            }), 404

        cursor.execute("""
            UPDATE users
            SET
                name = %s,
                phone = %s
            WHERE user_id = %s
        """, (
            name,
            phone,
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


# ----------------------------------------------------------
# DELETE USER
# ----------------------------------------------------------

@app.route('/users/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(user_id):

    try:

        logged_in_user_id = request.user['user_id']

        if int(user_id) != int(logged_in_user_id):
            return jsonify({
                "status": "failure",
                "message": "You can delete only your own account"
            }), 403

        cursor.execute("""
            SELECT user_id
            FROM users
            WHERE user_id = %s
        """, (user_id,))

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "status": "failure",
                "message": "User not found"
            }), 404

        cursor.execute("""
            SELECT account_id
            FROM accounts
            WHERE user_id = %s
        """, (user_id,))

        account_rows = cursor.fetchall()

        account_ids = [
            row['account_id']
            for row in account_rows
        ]

        if account_ids:

            placeholders = ','.join(
                ['%s'] * len(account_ids)
            )

            cursor.execute(
                f"""
                DELETE FROM transactions
                WHERE account_id IN ({placeholders})
                """,
                tuple(account_ids)
            )

            cursor.execute(
                f"""
                DELETE FROM accounts
                WHERE account_id IN ({placeholders})
                """,
                tuple(account_ids)
            )

        cursor.execute("""
            DELETE FROM users
            WHERE user_id = %s
        """, (user_id,))

        db.commit()

        return jsonify({
            "status": "success",
            "message": "User account deleted successfully"
        }), 200

    except Exception as e:

        db.rollback()

        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500


# ==========================================================
# LOGIN
# ==========================================================

@app.route('/login', methods=['POST'])
def login():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "status": "failure",
                "message": "Login data is required"
            }), 400

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({
                "status": "failure",
                "message": "Email and password are required"
            }), 400

        cursor.execute("""
            SELECT *
            FROM users
            WHERE email = %s
        """, (email,))

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "status": "failure",
                "message": "Invalid email or password"
            }), 401

        password_matches = bcrypt.checkpw(
            password.encode('utf-8'),
            user['password'].encode('utf-8')
        )

        if not password_matches:
            return jsonify({
                "status": "failure",
                "message": "Invalid email or password"
            }), 401

        current_time = datetime.now(timezone.utc)

        token_payload = {
            "user_id": user['user_id'],
            "name": user['name'],
            "iat": current_time,
            "exp": current_time + timedelta(
                hours=JWT_EXPIRATION_HOURS
            )
        }

        token = jwt.encode(
            token_payload,
            JWT_SECRET_KEY,
            algorithm=JWT_ALGORITHM
        )

        return jsonify({
            "status": "success",
            "message": "Login successful",
            "data": {
                "user_id": user['user_id'],
                "name": user['name'],
                "token": token
            }
        }), 200

    except Exception as e:

        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500

    # ==========================================================
# FORGOT PASSWORD
# ==========================================================

@app.route('/forgot-password', methods=['POST'])
def forgot_password():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "failure",
                "message": "Data is required"
            }), 400

        email = data.get('email')
        new_password = data.get('new_password')

        if not email or not new_password:
            return jsonify({
                "status": "failure",
                "message": "Email and new password are required"
            }), 400

        # Find user
        cursor.execute("""
            SELECT user_id
            FROM users
            WHERE email = %s
        """, (email,))

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "status": "failure",
                "message": "Email not found"
            }), 404

        # Hash new password
        password_hash = bcrypt.hashpw(
            new_password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        # Update password
        cursor.execute("""
            UPDATE users
            SET password = %s
            WHERE user_id = %s
        """, (
            password_hash,
            user['user_id']
        ))

        db.commit()

        return jsonify({
            "status": "success",
            "message": "Password reset successfully"
        }), 200

    except Exception as e:

        db.rollback()

        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500


# ==========================================================
# ACCOUNT APIs
# ==========================================================


# ==========================================================
# ACCOUNT APIs
# ==========================================================


# ----------------------------------------------------------
# CREATE ACCOUNT
# ----------------------------------------------------------

@app.route('/accounts', methods=['POST'])
@token_required
def create_account():

    try:

        data = request.get_json()
        user_id = request.user['user_id']

        # ==================================================
        # GET ACCOUNT DATA
        # ==================================================

        account_number = data.get('account_number')
        account_type = data.get('account_type')
        branch = data.get('branch')
        bank_name = data.get('bank_name')
        ifsc_code = data.get('IFSC_code')

        # ==================================================
        # ACCOUNT NUMBER VALIDATION
        # ==================================================

        if account_number is None:
            return jsonify({
                "status": "failure",
                "message": "Account number is required"
            }), 400

        account_number = str(account_number).strip()

        if (
            not account_number.isdigit()
            or len(account_number) != 10
        ):
            return jsonify({
                "status": "failure",
                "message": "Account number must be exactly 10 digits"
            }), 400

        # ==================================================
        # OTHER FIELD VALIDATION
        # ==================================================

        if (
            not account_type
            or not branch
            or not bank_name
            or not ifsc_code
        ):
            return jsonify({
                "status": "failure",
                "message": "All account details are required"
            }), 400

        # ==================================================
        # CHECK USER EXISTS
        # ==================================================

        cursor.execute(
            """
            SELECT user_id
            FROM users
            WHERE user_id = %s
            """,
            (user_id,)
        )

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "status": "failure",
                "message": "User not found"
            }), 404

        # ==================================================
        # CHECK ACCOUNT NUMBER ALREADY EXISTS
        # ==================================================

        cursor.execute(
            """
            SELECT account_id
            FROM accounts
            WHERE account_number = %s
            """,
            (account_number,)
        )

        existing_account = cursor.fetchone()

        if existing_account:
            return jsonify({
                "status": "failure",
                "message": "Account number already exists"
            }), 400

        # ==================================================
        # CREATE ACCOUNT
        # ==================================================

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
            user_id,
            account_number,
            ifsc_code,
            bank_name,
            account_type,
            branch,
            0
        ))

        db.commit()

        return jsonify({
            "status": "success",
            "message": "Account created successfully",
            "data": {
                "account_id": cursor.lastrowid,
                "account_number": account_number
            }
        }), 201

    except Exception as e:

        db.rollback()

        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500


# ----------------------------------------------------------
# GET LOGGED-IN USER ACCOUNTS
# ----------------------------------------------------------

@app.route('/accounts', methods=['GET'])
@token_required
def get_all_accounts():

    try:

        user_id = request.user['user_id']

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
            WHERE user_id = %s
            ORDER BY account_id DESC
        """, (user_id,))

        accounts = cursor.fetchall()

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


# ----------------------------------------------------------
# LOOKUP ACCOUNT BY ACCOUNT NUMBER
# ----------------------------------------------------------

@app.route(
    '/accounts/lookup/<account_number>',
    methods=['GET']
)
@token_required
def lookup_account(account_number):

    try:

        cursor.execute("""
            SELECT
                accounts.account_id,
                accounts.account_number,
                users.name AS account_holder
            FROM accounts
            JOIN users
                ON accounts.user_id = users.user_id
            WHERE accounts.account_number = %s
        """, (account_number,))

        account = cursor.fetchone()

        if not account:
            return jsonify({
                "status": "failure",
                "message": "Account not found"
            }), 404

        return jsonify({
            "status": "success",
            "message": "Account found",
            "data": {
                "account_id": account['account_id'],
                "account_number": account['account_number'],
                "account_holder": account['account_holder']
            }
        }), 200

    except Exception as e:

        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500


# ----------------------------------------------------------
# GET ACCOUNT BY ID
# ----------------------------------------------------------

@app.route(
    '/accounts/<int:account_id>',
    methods=['GET']
)
@token_required
def get_account_by_id(account_id):

    try:

        user_id = request.user['user_id']

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
            WHERE account_id = %s
            AND user_id = %s
        """, (
            account_id,
            user_id
        ))

        account = cursor.fetchone()

        if not account:
            return jsonify({
                "status": "failure",
                "message": "Account not found"
            }), 404

        return jsonify({
            "status": "success",
            "message": "Account details retrieved successfully",
            "data": account
        }), 200

    except Exception as e:

        return jsonify({
            "status": "failure",
            "message": str(e)
        }), 500


# ----------------------------------------------------------
# DELETE ACCOUNT
# ----------------------------------------------------------

@app.route(
    '/accounts/<int:account_id>',
    methods=['DELETE']
)
@token_required
def delete_account(account_id):

    try:

        user_id = request.user['user_id']

        cursor.execute("""
            SELECT account_id
            FROM accounts
            WHERE account_id = %s
            AND user_id = %s
        """, (
            account_id,
            user_id
        ))

        account = cursor.fetchone()

        if not account:
            return jsonify({
                "status": "failure",
                "message": "Account not found"
            }), 404

        cursor.execute("""
            DELETE FROM transactions
            WHERE account_id = %s
        """, (account_id,))

        cursor.execute("""
            DELETE FROM accounts
            WHERE account_id = %s
            AND user_id = %s
        """, (
            account_id,
            user_id
        ))

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


# ----------------------------------------------------------
# DEPOSIT / WITHDRAW / TRANSFER
# ----------------------------------------------------------

@app.route('/transactions', methods=['POST'])
@token_required
def perform_transaction():

    try:

        data = request.get_json()

        transaction_type = data.get('transaction_type')
        amount = float(data.get('amount', 0))

        if amount <= 0:
            return jsonify({
                "status": "failure",
                "message": "Amount must be greater than zero"
            }), 400

        user_id = request.user['user_id']

        # ==================================================
        # DEPOSIT
        # ==================================================

        if transaction_type == 'DEPOSIT':

            account_id = data.get('account_id')

            cursor.execute("""
                SELECT
                    accounts.account_id,
                    accounts.balance,
                    users.name
                FROM accounts
                JOIN users
                    ON accounts.user_id = users.user_id
                WHERE accounts.account_id = %s
                AND accounts.user_id = %s
            """, (
                account_id,
                user_id
            ))

            account = cursor.fetchone()

            if not account:
                return jsonify({
                    "status": "failure",
                    "message": "Account not found"
                }), 404

            new_balance = (
                float(account['balance']) + amount
            )

            cursor.execute("""
                UPDATE accounts
                SET balance = %s
                WHERE account_id = %s
                AND user_id = %s
            """, (
                new_balance,
                account_id,
                user_id
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
                'Money deposited'
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
                SELECT
                    accounts.account_id,
                    accounts.balance,
                    users.name
                FROM accounts
                JOIN users
                    ON accounts.user_id = users.user_id
                WHERE accounts.account_id = %s
                AND accounts.user_id = %s
            """, (
                account_id,
                user_id
            ))

            account = cursor.fetchone()

            if not account:
                return jsonify({
                    "status": "failure",
                    "message": "Account not found"
                }), 404

            current_balance = float(
                account['balance']
            )

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
                AND user_id = %s
            """, (
                new_balance,
                account_id,
                user_id
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
                'Cash withdrawal'
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

            from_account_id = data.get(
                'from_account_id'
            )

            to_account_id = data.get(
                'to_account_id'
            )

            if not from_account_id or not to_account_id:
                return jsonify({
                    "status": "failure",
                    "message": "Sender and receiver accounts are required"
                }), 400

            if str(from_account_id) == str(to_account_id):
                return jsonify({
                    "status": "failure",
                    "message": "Sender and receiver accounts cannot be the same"
                }), 400

            # --------------------------------------------------
            # SENDER
            # --------------------------------------------------

            cursor.execute("""
                SELECT
                    accounts.account_id,
                    accounts.account_number,
                    accounts.balance,
                    users.name
                FROM accounts
                JOIN users
                    ON accounts.user_id = users.user_id
                WHERE accounts.account_id = %s
                AND accounts.user_id = %s
            """, (
                from_account_id,
                user_id
            ))

            sender = cursor.fetchone()

            # --------------------------------------------------
            # RECEIVER
            # --------------------------------------------------

            cursor.execute("""
                SELECT
                    accounts.account_id,
                    accounts.account_number,
                    accounts.balance,
                    users.name
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

            sender_balance = float(
                sender['balance']
            )

            if sender_balance < amount:
                return jsonify({
                    "status": "failure",
                    "message": "Insufficient balance"
                }), 400

            new_sender_balance = (
                sender_balance - amount
            )

            new_receiver_balance = (
                float(receiver['balance']) + amount
            )

            # --------------------------------------------------
            # UPDATE SENDER
            # --------------------------------------------------

            cursor.execute("""
                UPDATE accounts
                SET balance = %s
                WHERE account_id = %s
                AND user_id = %s
            """, (
                new_sender_balance,
                from_account_id,
                user_id
            ))

            # --------------------------------------------------
            # UPDATE RECEIVER
            # --------------------------------------------------

            cursor.execute("""
                UPDATE accounts
                SET balance = %s
                WHERE account_id = %s
            """, (
                new_receiver_balance,
                to_account_id
            ))

            # --------------------------------------------------
            # SENDER TRANSACTION
            # --------------------------------------------------

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
                f'Money transferred to {receiver["name"]}'
            ))

            # --------------------------------------------------
            # RECEIVER TRANSACTION
            # --------------------------------------------------

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
                f'Received money from {sender["name"]}'
            ))

            db.commit()

            return jsonify({
                "status": "success",
                "message": "Funds transferred successfully"
            }), 200

        # ==================================================
        # INVALID TRANSACTION TYPE
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
# GET LOGGED-IN USER TRANSACTION HISTORY
# ==========================================================

@app.route('/transactions', methods=['GET'])
@token_required
def get_my_transactions():

    try:

        user_id = request.user['user_id']

        cursor.execute("""
            SELECT
                t.transaction_id,
                t.account_id,
                a.account_number,
                t.transaction_type,
                t.amount,
                t.balance_after_transaction,
                t.sender_name,
                t.receiver_name,
                t.description,
                t.created_at
            FROM transactions t
            INNER JOIN accounts a
                ON t.account_id = a.account_id
            WHERE a.user_id = %s
            ORDER BY
                t.created_at DESC,
                t.transaction_id DESC
        """, (user_id,))

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


# ==========================================================
# GET TRANSACTION HISTORY FOR ONE ACCOUNT
# ==========================================================

@app.route(
    '/transactions/<int:account_id>',
    methods=['GET']
)
@token_required
def get_transaction_history(account_id):

    try:

        user_id = request.user['user_id']

        cursor.execute("""
            SELECT account_id
            FROM accounts
            WHERE account_id = %s
            AND user_id = %s
        """, (
            account_id,
            user_id
        ))

        account = cursor.fetchone()

        if not account:
            return jsonify({
                "status": "failure",
                "message": "Account not found"
            }), 404

        cursor.execute("""
            SELECT
                t.transaction_id,
                t.account_id,
                a.account_number,
                t.transaction_type,
                t.amount,
                t.balance_after_transaction,
                t.sender_name,
                t.receiver_name,
                t.description,
                t.created_at
            FROM transactions t
            INNER JOIN accounts a
                ON t.account_id = a.account_id
            WHERE t.account_id = %s
            ORDER BY
                t.created_at DESC,
                t.transaction_id DESC
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


# ==========================================================
# RUN APPLICATION
# ==========================================================

if __name__ == '__main__':
    app.run(debug=True)