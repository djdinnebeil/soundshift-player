from flask.cli import AppGroup
from .users import seed_users, undo_users
from .songs import seed_songs, undo_songs
from .history import seed_history, undo_history
from .playlists import seed_playlists, undo_playlists
from app.models.db import environment

seed_commands = AppGroup('seed')

# Creates the `flask seed all` command
@seed_commands.command('all')
def seed():
    if environment == 'production':
        # Before seeding in production, truncate all tables
        undo_history()
        undo_songs()
        undo_users()
        undo_playlists()
    seed_users()
    seed_songs()
    seed_history()
    seed_playlists()

# Creates the `flask seed undo` command
@seed_commands.command('undo')
def undo():
    undo_history()
    undo_songs()
    undo_users()
    undo_playlists()
