from flask_sqlalchemy import SQLAlchemy
from app.config import environment, schema

db = SQLAlchemy()

def add_prefix_for_prod(attr):
    if environment == "production":
        return f"{schema}.{attr}"
    else:
        return attr
