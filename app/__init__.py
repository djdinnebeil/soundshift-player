from flask import Flask, render_template
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from .config import Config
from app.models import db
from app.routes.auth_routes import auth_routes
from app.routes.song_routes import song_routes
from app.routes.playlist_routes import playlist_routes
from app.routes.history_routes import history_routes
from app.routes.upload_routes import upload_routes
from app.seeds import seed_commands

app = Flask(__name__)

# Configuration
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)

app.cli.add_command(seed_commands)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'

@login_manager.user_loader
def load_user(user_id):
    from app.models.user import User
    return User.query.get(int(user_id))

# Register blueprints
app.register_blueprint(auth_routes)
app.register_blueprint(history_routes, url_prefix='/history')
app.register_blueprint(song_routes, url_prefix='/songs')
app.register_blueprint(playlist_routes, url_prefix='/playlists')
app.register_blueprint(upload_routes, url_prefix='/upload')

@app.route('/')
def home():
    return render_template('home.html')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404
