from flask import Flask, request, jsonify
import mysql.connector

app = Flask(__name__)

# DB connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",  # <-- change this
    database="bank_db"
)

cursor = db.cursor(dictionary=True)

# CREATE USER
@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    try:
        query = "INSERT INTO users (name,email,phone,password) VALUES (%s,%s,%s,%s)"
        values = (data['name'], data['email'], data['phone'], data['password'])
        cursor.execute(query, values)
        db.commit()

        return jsonify({
            "status": "success",
            "message": "User created successfully",
            "data": {"user_id": cursor.lastrowid}
        })
    except Exception as e:
        return jsonify({
            "status": "failure",
            "message": str(e),
            "data": None
        })

# GET USERS
@app.route('/users', methods=['GET'])
def get_users():
    cursor.execute("SELECT user_id,name FROM users")
    result = cursor.fetchall()

    if not result:
        return jsonify({
            "status": "failure",
            "message": "No users found",
            "data": None
        })

    return jsonify({
        "status": "success",
        "message": "Users fetched successfully",
        "data": result
    })

# CREATE ACCOUNT
@app.route('/accounts', methods=['POST'])
def create_account():
    data = request.json

    cursor.execute("SELECT * FROM users WHERE user_id=%s", (data['user_id'],))
    user = cursor.fetchone()

    if not user:
        return jsonify({
            "status": "failure",
            "message": "Invalid user_id",
            "data": None
        })

    cursor.execute(
        "INSERT INTO accounts (user_id, account_number) VALUES (%s,%s)",
        (data['user_id'], data['account_number'])
    )
    db.commit()

    return jsonify({
        "status": "success",
        "message": "Account created successfully",
        "data": {"account_id": cursor.lastrowid}
    })

# DEPOSIT
@app.route('/transactions/deposit', methods=['POST'])
def deposit():
    data = request.json

    cursor.execute("SELECT balance FROM accounts WHERE account_id=%s", (data['account_id'],))
    acc = cursor.fetchone()

    if not acc:
        return jsonify({
            "status": "failure",
            "message": "Invalid account",
            "data": None
        })

    new_balance = float(acc['balance']) + float(data['amount'])

    cursor.execute(
        "UPDATE accounts SET balance=%s WHERE account_id=%s",
        (new_balance, data['account_id'])
    )
    db.commit()

    return jsonify({
        "status": "success",
        "message": "Deposit successful",
        "data": {"balance": new_balance}
    })
# GET USER BY ID
@app.route('/users/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    cursor.execute("SELECT * FROM users WHERE user_id=%s", (user_id,))
    user = cursor.fetchone()

    if not user:
        return jsonify({
            "status": "failure",
            "message": "User not found",
            "data": None
        })

    return jsonify({
        "status": "success",
        "message": "User fetched successfully",
        "data": user
    })


# UPDATE USER
@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.get_json()

    cursor.execute("SELECT * FROM users WHERE user_id=%s", (user_id,))
    if not cursor.fetchone():
        return jsonify({
            "status": "failure",
            "message": "User not found",
            "data": None
        })

    cursor.execute(
        "UPDATE users SET name=%s WHERE user_id=%s",
        (data['name'], user_id)
    )
    db.commit()

    return jsonify({
        "status": "success",
        "message": "User updated successfully",
        "data": None
    })


# DELETE USER
@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    cursor.execute("SELECT * FROM users WHERE user_id=%s", (user_id,))
    if not cursor.fetchone():
        return jsonify({
            "status": "failure",
            "message": "User not found",
            "data": None
        })

    cursor.execute("DELETE FROM users WHERE user_id=%s", (user_id,))
    db.commit()

    return jsonify({
        "status": "success",
        "message": "User deleted successfully",
        "data": None
    })


# WITHDRAW
@app.route('/transactions/withdraw', methods=['POST'])
def withdraw():
    data = request.get_json()

    cursor.execute("SELECT balance FROM accounts WHERE account_id=%s", (data['account_id'],))
    acc = cursor.fetchone()

    if not acc:
        return jsonify({
            "status": "failure",
            "message": "Invalid account",
            "data": None
        })

    if float(acc['balance']) < float(data['amount']):
        return jsonify({
            "status": "failure",
            "message": "Insufficient balance",
            "data": None
        })

    new_balance = float(acc['balance']) - float(data['amount'])

    cursor.execute(
        "UPDATE accounts SET balance=%s WHERE account_id=%s",
        (new_balance, data['account_id'])
    )
    db.commit()

    return jsonify({
        "status": "success",
        "message": "Withdraw successful",
        "data": {"balance": new_balance}
    })

if __name__ == '__main__':
    app.run(debug=True)