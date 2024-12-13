from app.models import Playlist, db, Song
from flask_login import current_user
from flask import session
playlist_sort_option = 'updated'

def get_sorted_playlists():
    user_id = current_user.id
    sort_order = current_user.playlist_sort_order or 'name'
    if sort_order == 'name':
        playlists = Playlist.query.filter_by(user_id=user_id).order_by(Playlist.name.asc()).all()
    elif sort_order == 'created':
        playlists = Playlist.query.filter_by(user_id=user_id).order_by(Playlist.created_at.desc()).all()
    elif sort_order == 'updated':
        playlists = Playlist.query.filter_by(user_id=user_id).order_by(Playlist.updated_at.desc()).all()
    return playlists
