from app.models.db import db, environment, schema
from app.models import User
from werkzeug.security import generate_password_hash
from sqlalchemy.sql import text

def seed_users():
    users = [
        User(
            username='demo@aa.io',
            email='demo@aa.io',
            password='password'
        ),
        User(
            username='djdinnebeil@aa.io',
            email='djdinnebeil@aa.io',
            password='password'
        ),
        User(
            username='dd42@aa.io',
            email='dd42@aa.io',
            password='password'
        ),
    ]
    db.session.bulk_save_objects(users)
    db.session.commit()


def undo_users():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {schema}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM users"))

    db.session.commit()
