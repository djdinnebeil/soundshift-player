from flask import Blueprint, request, jsonify, render_template, redirect, url_for
from flask_login import login_required, current_user
from app.models import Playlist, db, Song

playlist_routes = Blueprint('playlists', __name__)

@playlist_routes.route('/', methods=['GET'])
@login_required
def view_user_playlists():
    user_id = current_user.id
    playlists = Playlist.query.filter_by(user_id=user_id).all()
    return render_template('playlists.html', playlists=[playlist.to_dict() for playlist in playlists])

@playlist_routes.route('/current', methods=['GET'])
@login_required
def get_user_playlists():
    user_id = current_user.id
    playlists = Playlist.query.filter_by(user_id=user_id).all()
    return jsonify([playlist.to_dict() for playlist in playlists])


@playlist_routes.route('/<int:playlist_id>', methods=['GET'])
@login_required
def get_playlist(playlist_id):
    playlist = Playlist.query.filter_by(id=playlist_id, user_id=current_user.id).first()
    playlists = Playlist.query.filter_by(user_id=current_user.id).all()
    if not playlist:
        return jsonify({"error": "Playlist not found"}), 404
    return render_template('playlist_music_player.html', playlist=playlist.to_dict(), playlists=playlists)


@playlist_routes.route('/<int:playlist_id>/songs/<int:song_id>/<int:song_order>', methods=['DELETE'])
@login_required
def remove_song_from_playlist(playlist_id, song_id, song_order):
    playlist = Playlist.query.filter_by(id=playlist_id, user_id=current_user.id).first()
    if not playlist:
        return jsonify({"error": "Playlist not found"}), 404

    entry = db.session.execute(
        """
        SELECT * FROM playlist_songs
        WHERE playlist_id = :playlist_id AND song_id = :song_id AND song_order = :song_order
        """,
        {"playlist_id": playlist_id, "song_id": song_id, "song_order": song_order}
    ).fetchone()

    if not entry:
        return jsonify({"error": "Song entry not found in playlist"}), 404

    db.session.execute(
        """
        DELETE FROM playlist_songs
        WHERE playlist_id = :playlist_id AND song_id = :song_id AND song_order = :song_order
        """,
        {"playlist_id": playlist_id, "song_id": song_id, "song_order": song_order}
    )

    db.session.commit()
    return jsonify({"message": "Song removed successfully", "song_id": song_id, "song_order": song_order}), 200

@playlist_routes.route('/create', methods=['GET'])
@login_required
def create_playlist_form():
    songs = Song.query.all()
    return render_template('create_playlist.html', songs=[song.to_dict() for song in songs])


@playlist_routes.route('/create', methods=['POST'])
@login_required
def create_playlist():
    data = request.form
    name = data.get('name')
    song_entries = data.get('songs')  # Comma-separated "id:order" pairs

    if not name:
        return jsonify({"error": "Playlist name is required"}), 400

    # Parse "id:order" pairs into a list of dictionaries
    if song_entries:
        song_entries = [
            {"id": int(entry.split(':')[0]), "song_order": int(entry.split(':')[1])}
            for entry in song_entries.split(',')
        ]
    else:
        song_entries = []  # Allow empty playlists

    new_playlist = Playlist(user_id=current_user.id, name=name)
    db.session.add(new_playlist)
    db.session.commit()

    # Add selected songs with explicit order
    for entry in song_entries:
        song = Song.query.get(entry["id"])
        if song:
            db.session.execute(
                """
                INSERT INTO playlist_songs (playlist_id, song_id, song_order)
                VALUES (:playlist_id, :song_id, :song_order)
                """,
                {
                    "playlist_id": new_playlist.id,
                    "song_id": entry["id"],
                    "song_order": entry["song_order"],
                }
            )

    db.session.commit()
    return redirect(url_for('playlists.view_user_playlists'))



@playlist_routes.route('/<int:playlist_id>/edit', methods=['GET'])
@login_required
def edit_playlist_form(playlist_id):
    playlist = Playlist.query.filter_by(id=playlist_id, user_id=current_user.id).first()
    if not playlist:
        return jsonify({"error": "Playlist not found"}), 404

    available_songs = Song.query.all()

    song_entries = db.session.execute(
        """
        SELECT songs.id, songs.name, songs.artist, playlist_songs.song_order
        FROM playlist_songs
        JOIN songs ON playlist_songs.song_id = songs.id
        WHERE playlist_songs.playlist_id = :playlist_id
        ORDER BY playlist_songs.song_order
        """,
        {"playlist_id": playlist.id}
    ).fetchall()


    # Convert the results into a list of dictionaries
    playlist_data = {
        "id": playlist.id,
        "name": playlist.name,
        "songs": [
            {"id": str(row[0]), "name": row[1], "artist": row[2], "song_order": row[3]}
            for row in song_entries
        ]
    }

    return render_template('edit_playlist.html', playlist=playlist_data, songs=available_songs)


@playlist_routes.route('/<int:playlist_id>/edit', methods=['POST'])
@login_required
def update_playlist(playlist_id):
    playlist = Playlist.query.filter_by(id=playlist_id, user_id=current_user.id).first()
    if not playlist:
        return jsonify({"error": "Playlist not found"}), 404

    data = request.form
    name = data.get('name')
    song_entries = data.get('songs')  # Comma-separated "id:order" pairs

    if not name:
        return jsonify({"error": "Playlist name is required"}), 400

    # Parse "id:order" pairs into a list of dictionaries
    if song_entries:
        try:
            song_entries = [
                {"id": int(entry.split(':')[0]), "song_order": int(entry.split(':')[1])}
                for entry in song_entries.split(',') if ':' in entry
            ]
        except ValueError:
            return jsonify({"error": "Invalid song data provided"}), 400
    else:
        song_entries = []

    playlist.name = name
    db.session.commit()

    db.session.execute(
        "DELETE FROM playlist_songs WHERE playlist_id = :playlist_id",
        {"playlist_id": playlist.id}
    )

    for entry in song_entries:
        db.session.execute(
            """
            INSERT INTO playlist_songs (playlist_id, song_id, song_order)
            VALUES (:playlist_id, :song_id, :song_order)
            """,
            {"playlist_id": playlist.id, "song_id": entry["id"], "song_order": entry["song_order"]}
        )

    db.session.commit()
    return redirect(url_for('playlists.view_user_playlists'))


@playlist_routes.route('/<int:playlist_id>/delete', methods=['POST'])
@login_required
def delete_playlist(playlist_id):
    playlist = Playlist.query.filter_by(id=playlist_id, user_id=current_user.id).first()
    if not playlist:
        return jsonify({"error": "Playlist not found"}), 404

    db.session.execute(
        "DELETE FROM playlist_songs WHERE playlist_id = :playlist_id",
        {"playlist_id": playlist.id}
    )

    db.session.delete(playlist)
    db.session.commit()

    return jsonify({"message": "Playlist deleted successfully"}), 200
