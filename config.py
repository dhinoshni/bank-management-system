import os


class Config:
    MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_USER = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "root")
    MYSQL_DB = os.getenv("MYSQL_DB", "bank_db")

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "bank_management_secret_key_2026"
    )

    JWT_EXPIRATION_HOURS = int(
        os.getenv("JWT_EXPIRATION_HOURS", "1")
    )

    JWT_ALGORITHM = os.getenv(
        "JWT_ALGORITHM",
        "HS256"
    )