from .db import db, environment, schema, add_prefix_for_prod
from .tables import playlist_songs
from .song import Song
from datetime import datetime

class Playlist(db.Model):
    __tablename__ = 'playlists'

    if environment == "production":
        __table_args__ = {'schema': schema}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    user = db.relationship('User', back_populates='playlists')
    songs = db.relationship(
        'Song',
        secondary=playlist_songs,
        back_populates='playlists',
        order_by=playlist_songs.c.song_order
    )

    def to_dict(self):
        song_entries = db.session.query(Song, playlist_songs.c.song_order) \
            .join(playlist_songs, Song.id == playlist_songs.c.song_id) \
            .filter(playlist_songs.c.playlist_id == self.id) \
            .order_by(playlist_songs.c.song_order).all()

        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'created_at': self.created_at.strftime('%b %d, %Y %I:%M %p') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%b %d, %Y %I:%M %p') if self.updated_at else None,
            'songs': [
                {
                    'id': song.id,
                    'name': song.name,
                    'artist': song.artist,
                    'file_url': song.file_url,  # Ensure this field is included
                    'song_order': song_order
                }
                for song, song_order in song_entries
            ]
        }
