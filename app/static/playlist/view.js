function deletePlaylist(playlistId)
{
  if (!confirm('Are you sure you want to delete this playlist?')) {
    return;
  }

  fetch(`/playlists/${playlistId}/delete`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'}
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete playlist');
      }
      return response.json();
    })
    .then(data => {
      // Remove the playlist from the DOM
      const playlistElement = document.getElementById(`playlist-${playlistId}`);
      if (playlistElement) {
        playlistElement.remove();
      }
    })
    .catch(error => {
      console.error('Error deleting playlist:', error);
      alert(error.message);
    });
}
