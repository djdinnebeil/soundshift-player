from app.models.db import db, environment, schema
from app.models import Song
from sqlalchemy.sql import text
from app.config import music_server_url

def seed_songs():
    songs = [
        Song(
            user_id=1,
            name='Breezy',
            artist='FF8',
            album='OST',
            genre='RPG',
            duration=210,
            file_url=f'{music_server_url}/FF8-OST-Breezy.mp3'
        ),
        Song(
            user_id=1,
            name='Compression of Time',
            artist='FF8',
            album='OST',
            genre='RPG',
            duration=180,
            file_url=f'{music_server_url}/FF8-OST-Compression_of_Time.mp3'
        ),
        Song(
            user_id=2,
            name='Ending Theme',
            artist='FF8',
            album='OST',
            genre='RPG',
            duration=240,
            file_url=f'{music_server_url}/FF8-OST-Ending_Theme.mp3'
        ),
        Song(
            user_id=2,
            name='Eyes on Me',
            artist='FF8',
            album='OST',
            genre='RPG',
            duration=240,
            file_url=f'{music_server_url}/FF8-OST-Eyes_on_Me.mp3'
        ),
        Song(
            user_id=3,
            name='Junction',
            artist='FF8',
            album='OST',
            genre='RPG',
            duration=240,
            file_url=f'{music_server_url}/FF8-OST-Junction.mp3'
        ),
        Song(
            user_id=1,
            name='Blue Sky',
            artist='FF8',
            album='OST',
            genre='RPG',
            duration=240,
            file_url=f'{music_server_url}/FF8-OST-Blue_Sky.mp3'
        ),
        Song(
            user_id=1,
            name='Blue Fields',
            artist='FF8',
            album='OST',
            genre='RPG',
            duration=240,
            file_url=f'{music_server_url}/FF8-OST-Blue_Fields.mp3'
        ),
        Song(
            user_id=1,
            name='Under Her Control',
            artist='FF8',
            album='OST',
            genre='RPG',
            duration=240,
            file_url=f'{music_server_url}/FF8-OST-Under_Her_Control.mp3'
        ),
        Song(
            user_id=1,
            name='Data Screen',
            artist='FFT',
            album='OST',
            genre='RPG',
            duration=240,
            file_url=f'{music_server_url}/FFT-OST-Data_Screen.mp3'
        ),
        Song(
            user_id=1,
            name='Mission Complete',
            artist='FFT',
            album='OST',
            genre='RPG',
            duration=140,
            file_url=f'{music_server_url}/FFT-OST-Mission_Complete.mp3'
        ),
        Song(
            user_id=2,
            name='Windmill Hut',
            artist='Zelda',
            album='OST',
            genre='RPG',
            duration=140,
            file_url=f'{music_server_url}/Zelda-OST-Windmill_Hut.mp3'
        ),
    ]
    db.session.bulk_save_objects(songs)
    db.session.commit()


def undo_songs():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {schema}.songs RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM songs"))
    db.session.commit()
