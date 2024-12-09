from .db import db, environment, schema, add_prefix_for_prod

# Association table for playlists and songs
playlist_songs = db.Table(
    'playlist_songs',
    db.Model.metadata,
    db.Column('playlist_id', db.Integer, db.ForeignKey(add_prefix_for_prod('playlists.id')), primary_key=True),
    db.Column('song_id', db.Integer, db.ForeignKey(add_prefix_for_prod('songs.id')), primary_key=True),
    db.Column('song_order', db.Integer, nullable=False, primary_key=True),
    schema=schema if environment == "production" else None
)
