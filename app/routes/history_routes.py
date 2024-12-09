from flask import Blueprint, jsonify, render_template
from flask_login import current_user, login_required
from app.models import db, History
from sqlalchemy.orm import joinedload

history_routes = Blueprint('history', __name__)

@history_routes.route('/', methods=['GET'])
@login_required
def view_history():
    history = History.query.options(joinedload(History.song)).filter_by(user_id=current_user.id).order_by(History.play_count.desc()).all()
    history_data = [entry.to_dict() for entry in history]
    return render_template('listening_history.html', history=history_data)


@history_routes.route('/reset/<int:history_id>', methods=['POST'])
@login_required
def reset_play_count(history_id):
    history_entry = History.query.filter_by(user_id=current_user.id, id=history_id).first()
    if not history_entry:
        return jsonify({"error": "History entry not found"}), 404

    history_entry.play_count = 0
    history_entry.last_played = None

    db.session.commit()
    return jsonify({"message": "Play count reset successfully", "history_id": history_id}), 200


@history_routes.route('/remove/<int:history_id>', methods=['DELETE'])
@login_required
def remove_from_history(history_id):
    history_entry = History.query.filter_by(user_id=current_user.id, id=history_id).first()
    if not history_entry:
        return jsonify({"error": "History entry not found"}), 404

    db.session.delete(history_entry)
    db.session.commit()
    return jsonify({"message": "Song removed from history", "song_id": history_id}), 200
