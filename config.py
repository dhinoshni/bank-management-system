import os

class Config:
    MYSQL_HOST = "localhost"
    MYSQL_USER = "root"
    MYSQL_PASSWORD = "root"   #  MySQL password
    MYSQL_DB = "bank_db"

    JWT_SECRET_KEY = "bank_management_secret_key_2026"
    JWT_EXPIRATION_HOURS = 1
    JWT_ALGORITHM = "HS256"