import bcrypt
import mysql.connector
from config import Config


# Connect to the database
db = mysql.connector.connect(
    host=Config.MYSQL_HOST,
    user=Config.MYSQL_USER,
    password=Config.MYSQL_PASSWORD,
    database=Config.MYSQL_DB
)

cursor = db.cursor(dictionary=True)


# Get all users
cursor.execute("""
    SELECT user_id, password
    FROM users
""")

users = cursor.fetchall()


for user in users:

    password = user["password"]

    # Convert plaintext password into bcrypt hash
    password_hash = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    # Update the user's password
    cursor.execute("""
        UPDATE users
        SET password = %s
        WHERE user_id = %s
    """, (
        password_hash,
        user["user_id"]
    ))


# Save changes
db.commit()

print(f"Successfully migrated {len(users)} user passwords.")


cursor.close()
db.close()