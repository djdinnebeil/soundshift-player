from app.models.db import db, environment, schema
from app.models import History
from sqlalchemy.sql import text
from datetime import datetime

def seed_history():
    histories = [
        History(
            user_id=1,
            song_id=1,
            play_count=10,
            first_played=datetime(2024, 1, 1),
            last_played=datetime(2024, 11, 20)
        ),
        History(
            user_id=1,
            song_id=2,
            play_count=5,
            first_played=datetime(2024, 1, 10),
            last_played=datetime(2024, 11, 21)
        ),
        History(
            user_id=2,
            song_id=3,
            play_count=8,
            first_played=datetime(2024, 2, 15),
            last_played=datetime(2024, 11, 22)
        ),
        History(
            user_id=1,
            song_id=6,
            play_count=0,
            first_played=datetime(2024, 2, 15)
        ),
        History(
            user_id=1,
            song_id=7,
            play_count=0,
            first_played=datetime(2024, 2, 15)
        ),
        History(
            user_id=1,
            song_id=8,
            play_count=0,
            first_played=datetime(2024, 2, 15)
        ),
        History(
            user_id=1,
            song_id=9,
            play_count=0,
            first_played=datetime(2024, 2, 15)
        ),
    ]

    db.session.bulk_save_objects(histories)
    db.session.commit()

def undo_history():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {schema}.history RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM history"))
    db.session.commit()
