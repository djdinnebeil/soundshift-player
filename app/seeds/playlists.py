from app.models.db import db, environment, schema
from app.models import Playlist, Song, playlist_songs
from sqlalchemy.sql import text

def seed_playlists():
    playlist1 = Playlist(user_id=1, name='Chill Vibes')
    playlist2 = Playlist(user_id=2, name='Epic Journeys')
    playlist3 = Playlist(user_id=3, name='Boss Battle Themes')
    playlist4 = Playlist(user_id=1, name='Bowser Battle Themes')
    playlist5 = Playlist(user_id=1, name='The Orange King')

    # Add playlists to the database
    db.session.add_all([playlist1, playlist2, playlist3, playlist4, playlist5])
    db.session.commit()

    # Fetch songs
    song1 = Song.query.filter_by(name='Breezy').first()
    song2 = Song.query.filter_by(name='Compression of Time').first()
    song3 = Song.query.filter_by(name='Ending Theme').first()
    song4 = Song.query.filter_by(name='Eyes on Me').first()
    song5 = Song.query.filter_by(name='Junction').first()
    song6 = Song.query.filter_by(name='Mission Complete').first()
    song7 = Song.query.filter_by(name='Windmill Hut').first()

    # Add songs to playlists with custom order
    playlist_songs_data = [
        # Chill Vibes
        {'playlist_id': playlist1.id, 'song_id': song1.id, 'song_order': 1},
        {'playlist_id': playlist1.id, 'song_id': song2.id, 'song_order': 2},
        {'playlist_id': playlist1.id, 'song_id': song3.id, 'song_order': 3},
        {'playlist_id': playlist1.id, 'song_id': song4.id, 'song_order': 4},
        {'playlist_id': playlist1.id, 'song_id': song5.id, 'song_order': 5},

        # Epic Journeys
        {'playlist_id': playlist2.id, 'song_id': song6.id, 'song_order': 1},
        {'playlist_id': playlist2.id, 'song_id': song2.id, 'song_order': 2},
        {'playlist_id': playlist2.id, 'song_id': song3.id, 'song_order': 3},
        {'playlist_id': playlist2.id, 'song_id': song4.id, 'song_order': 4},

        # Boss Battle Themes
        {'playlist_id': playlist3.id, 'song_id': song7.id, 'song_order': 1},
        {'playlist_id': playlist3.id, 'song_id': song2.id, 'song_order': 2},
        {'playlist_id': playlist3.id, 'song_id': song3.id, 'song_order': 3},
        {'playlist_id': playlist3.id, 'song_id': song4.id, 'song_order': 4},
        {'playlist_id': playlist3.id, 'song_id': song5.id, 'song_order': 5},

        # Bowser Battle Themes
        {'playlist_id': playlist4.id, 'song_id': song6.id, 'song_order': 1},
        {'playlist_id': playlist4.id, 'song_id': song3.id, 'song_order': 2},
        {'playlist_id': playlist4.id, 'song_id': song4.id, 'song_order': 3},
        {'playlist_id': playlist4.id, 'song_id': song5.id, 'song_order': 4},

        # The Orange King
        {'playlist_id': playlist5.id, 'song_id': song7.id, 'song_order': 1},
        {'playlist_id': playlist5.id, 'song_id': song4.id, 'song_order': 2},
        {'playlist_id': playlist5.id, 'song_id': song5.id, 'song_order': 3},
    ]

    # Insert data into playlist_songs table
    for entry in playlist_songs_data:
        stmt = playlist_songs.insert().values(**entry)
        db.session.execute(stmt)

    db.session.commit()

def undo_playlists():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {schema}.playlists RESTART IDENTITY CASCADE;")
        db.session.execute(f"TRUNCATE table {schema}.playlist_songs RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM playlists"))
        db.session.execute(text("DELETE FROM playlist_songs"))
    db.session.commit()
