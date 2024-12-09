const audioPlayer = document.getElementById('audio-player');
const audioSource = document.getElementById('audio-source');
const songInfo = document.getElementById('song-info');
const songsGrid = document.getElementById('songs-grid');
let songs = typeof initialSongs !== 'undefined' ? initialSongs : [];

let currentSongIndex = null;
let currentSongCard = null;

if (typeof initialSongs === 'undefined')
{
// Fetch and render the user's songs
  fetch('/songs/current')
    .then(response => response.json())
    .then(data => {
      songs = data;
      renderSongs(songs);
    })
    .catch(error => console.error('Error fetching songs:', error));
}

/**
 * Renders the list of songs in the UI.
 * @param {Array} songList - Array of song objects.
 */
function renderSongs(songList) {
    songsGrid.innerHTML = ''; // Clear existing content

    if (!songList || songList.length === 0) {
        songsGrid.innerHTML = '<p>No songs added.</p>';
        return;
    }

    songList.forEach((song, index) => {
        const songCardRow = document.createElement('div');
        songCardRow.className = 'song-card-row';
        songCardRow.dataset.songId = song.id;
        songCardRow.innerHTML = `
            <div class="song-card">
                <button onclick="loadSong(${index})" class="play-button">
                    <div class="song-details">
                        <span class="song-name">${song.name}<span class="song-artist"> by ${song.artist}</span></span>
                    </div>
                </button>
            </div>
            <button onclick="removeSong(${song.id})" class="remove-button">Delete</button>
        `;

        songsGrid.appendChild(songCardRow);
    });
}

/**
 * Loads and plays a song by its index.
 * @param {number} songIndex - The index of the song to load.
 */
function loadSong(songIndex) {
    if (songIndex < 0 || songIndex >= songs.length) {
        console.error('Invalid song index:', songIndex);
        return;
    }

    const song = songs[songIndex];
    if (!song || !song.file_url) {
        console.error('Invalid song data:', song);
        return;
    }

    currentSongIndex = songIndex;

    // Update audio player source and start playback
    audioPlayer.pause();
    audioSource.src = song.file_url;
    audioPlayer.load();
    audioPlayer.play().catch(err => console.error('Playback error:', err));
    songInfo.textContent = `${song.name} by ${song.artist}`;

    // Update the play count via a backend request
    fetch(`/songs/play/${song.id}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => console.log(`Play count updated: ${data.play_count}`))
        .catch(error => console.error('Error updating play count:', error));

    // Update the current song card
    if (currentSongCard) {
        currentSongCard.classList.remove('playing'); // Remove "playing" style from the previous card
        const nowPlayingLabel = currentSongCard.querySelector('.now-playing');
        if (nowPlayingLabel) nowPlayingLabel.remove(); // Remove the "Now Playing" label
    }

    currentSongCard = document.querySelector(`.song-card-row[data-song-id="${song.id}"]`);
    if (currentSongCard) {
        currentSongCard.classList.add('playing'); // Add "playing" style to the current card
        const nowPlayingLabel = document.createElement('span');
        nowPlayingLabel.className = 'now-playing';
        nowPlayingLabel.textContent = 'Now Playing';
        currentSongCard.querySelector('.song-details').appendChild(nowPlayingLabel);
    }
}

/**
 * Plays the next song in the playlist.
 */
function nextSong() {
    if (currentSongIndex === null || songs.length === 0) {
        console.log('No song is playing. Playing the first song.');
        loadSong(0);
        return;
    }

    let nextIndex = (currentSongIndex + 1) % songs.length;
    loadSong(nextIndex);
}

/**
 * Plays the previous song in the playlist.
 */
function previousSong() {
    if (currentSongIndex === null || songs.length === 0) {
        console.log('No song is playing. Playing the last song.');
        loadSong(songs.length - 1);
        return;
    }

    let prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(prevIndex);
}

/**
 * Stops playback and resets the UI.
 */
function stopPlayback() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    audioSource.src = '';
    audioPlayer.load(); // Ensure the cleared source is reflected
    songInfo.textContent = 'Select a song to play';
    currentSongIndex = null;
    if (currentSongCard) {
        currentSongCard.classList.remove('playing');
        const nowPlayingLabel = currentSongCard.querySelector('.now-playing');
        if (nowPlayingLabel) nowPlayingLabel.remove();
        currentSongCard = null;
    }
}

/**
 * Removes a song from the playlist and updates the UI.
 * @param {number} songId - The ID of the song to remove.
 */
function removeSong(songId) {
    if (!confirm('Are you sure you want to delete this song?')) {
        return;
    }

    fetch(`/upload/remove/${songId}`, { method: 'GET' })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || 'Failed to remove song');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log(`Song removed successfully: ${data.song_id}`);

            // Remove the song from the songs array
            songs = songs.filter(song => song.id !== songId);
            renderSongs(songs);

            // Stop playback if the current song is removed
            if (currentSongIndex !== null && songs[currentSongIndex]?.id === songId) {
                stopPlayback();
            }
        })
        .catch(error => {
            console.error('Error removing song:', error);
            alert('Failed to remove the song. Please try again.');
        });
}

// Event listener to automatically play the next song when the current one ends
audioPlayer.addEventListener('ended', nextSong);

