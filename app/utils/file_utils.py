from app.config import music_server_url
import requests
import uuid
import re

def format_filename(name, artist, album, file_ext):
    filename = f"{artist}-{album}-{name}.{file_ext}".replace(" ", "_")
    filename = re.sub(r'[<>:"/\\|?*]', '_', filename) # Replace invalid characters with '_'
    return filename


def get_unique_filename(filename):
    ext = filename.rsplit(".", 1)[1].lower()
    unique_filename = uuid.uuid4().hex
    return f"{unique_filename}.{ext}"


def handle_local_deletion(file_url):
    filename = file_url.split('/')[-1]
    local_server_url = f"{music_server_url}/{filename}"
    response = requests.delete(local_server_url)

    if response.status_code == 404:
        return 'Song record deleted successfully, but the song file was not found on the server.'
    elif response.status_code != 200:
        error_detail = response.json().get('error', 'Unknown error')
        return f'Failed to delete file from local server: {error_detail}, but record removed successfully'
    return 'Song deleted successfully from local server'
