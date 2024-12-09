from .db import db, environment, schema, add_prefix_for_prod
from .tables import playlist_songs
from datetime import datetime

class Song(db.Model):
    __tablename__ = 'songs'

    if environment == "production":
        __table_args__ = {'schema': schema}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    artist = db.Column(db.String(100), nullable=False)
    album = db.Column(db.String(100), nullable=True)
    genre = db.Column(db.String(50), nullable=True)
    duration = db.Column(db.Integer, nullable=False)  # Duration in seconds
    file_url = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    user = db.relationship('User', back_populates='songs')
    history = db.relationship('History', back_populates='song', cascade='all, delete-orphan')
    playlists = db.relationship('Playlist', secondary=playlist_songs, back_populates='songs')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'artist': self.artist,
            'album': self.album,
            'genre': self.genre,
            'duration': self.duration,
            'file_url': self.file_url,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
