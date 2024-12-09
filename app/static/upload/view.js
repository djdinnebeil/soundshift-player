let songs = [];
let currentSong = null; // Track the currently playing song
let isPlaying = false; // Track playback state

function fetchSongs() {
  fetch('/upload/current')
    .then(response => response.json())
    .then(data => {
      songs = data; // Store songs globally
      renderSongs();
      stopPlayback();
    })
    .catch(error => console.error('Error fetching songs:', error));
}

// Render the song list
function renderSongs() {
  const songListDiv = document.getElementById('song-list');
  songListDiv.innerHTML = `
    <div class="headers-row">
      <span class="column-header">Song Name</span>
      <span class="column-header">Artist</span>
      <span class="column-header">Album</span>
      <span class="column-header">Genre</span>
      <span class="column-header">Duration</span>
      <span class="column-header">Actions</span>
    </div>
  `;

  songs.forEach((song, index) => {
    const songRow = document.createElement('div');
    songRow.className = 'song-row';

    songRow.innerHTML = `
      <span>${song.name}</span>
      <span>${song.artist}</span>
      <span>${song.album || 'N/A'}</span>
      <span>${song.genre || 'N/A'}</span>
      <span>${song.duration}</span>
      <div class="song-actions">
        <button class="action-button update-btn" onclick="showUpdateForm(${index})">Update</button>
        <button class="action-button remove-btn" onclick="removeSong(${index})">Remove</button>
        <button class="action-button play-btn" id="play-${song.id}" onclick="playSong('${index}')">Play</button>
      </div>
    `;

    songListDiv.appendChild(songRow);
  });
}



function playSong(songIndex) {
  song = songs[songIndex];
  fileUrl = songs[songIndex].file_url;
  songId = song.id;
  songName = song.name;

  const audioPlayer = document.getElementById('audio-player');
  const songDisplay = document.getElementById('current-song');
  const playButton = document.getElementById(`play-${songId}`);

  // Reset all play buttons to "Play"
  document.querySelectorAll('.play-btn').forEach((button) => {
    button.innerText = "Play";
  });

  if (currentSong === songId) {
    if (isPlaying) {
      audioPlayer.pause();
      playButton.innerText = "Play";
      isPlaying = false;
    } else {
      audioPlayer.play();
      playButton.innerText = "Pause";
      isPlaying = true;
    }
  } else {
    playButton.innerText = "Pause";
    currentSong = songId;
    isPlaying = true;
    audioPlayer.src = fileUrl; // Set the source of the audio element
    audioPlayer.style.display = 'block'; // Make the player visible
    audioPlayer.play(); // Play the song
  }

  // Update the song display
  songDisplay.textContent = `Now Playing: ${songName}`;
  songDisplay.style.display = 'block';

  // Handle audio events
  audioPlayer.onended = () => {
    playButton.innerText = "Play";
    isPlaying = false;
  };

  audioPlayer.onpause = () => {
    isPlaying = false;
    playButton.innerText = "Play";
  };

  audioPlayer.onplay = () => {
    isPlaying = true;
    playButton.innerText = "Pause";
  };
}

// Stop playback and reset audio player
function stopPlayback() {
  const audioPlayer = document.getElementById('audio-player');
  const songDisplay = document.getElementById('current-song'); // Song name display

  audioPlayer.pause(); // Stop playback
  audioPlayer.src = ''; // Clear the audio source
  audioPlayer.style.display = 'none'; // Hide the audio player

  currentSong = null; // Reset current song
  isPlaying = false; // Reset playback state

  songDisplay.textContent = 'Now Playing: None'; // Reset the display
  songDisplay.style.display = 'none'; // Hide the Now Playing section
}

// Remove a song
function removeSong(songIndex) {
  if (confirm('Are you sure you want to delete this song?')) {
    const song = songs[songIndex];
    const songId = song.id;
    const songName = song.name;

    fetch(`/upload/remove/${songId}`, { method: 'GET' })
      .then(response => {
        if (response.ok) {
          fetchSongs(); // Refresh the list
          stopPlayback();
          const successMessage = document.getElementById('success-message');
          successMessage.innerHTML = `<span style="color: red;">${songName} deleted successfully.</span>`;
          successMessage.style.display = 'block';
        } else {
          alert('Failed to remove the song.');
        }
      })
      .catch(error => console.error('Error removing song:', error));
  }
}

// Show the update form for a song
function showUpdateForm(index) {
  const song = songs[index];
  const songListDiv = document.getElementById('song-list');
  songListDiv.innerHTML = `
    <div class="headers-row">
      <span class="column-header">Song Name</span>
      <span class="column-header">Artist</span>
      <span class="column-header">Album</span>
      <span class="column-header">Genre</span>
      <span class="column-header">Duration</span>
      <span class="column-header">Actions</span>
    </div>
  `;

  const songRow = document.createElement('div');
  songRow.className = 'song-row';
  songRow.innerHTML = `
    <input type="text" value="${song.name}" id="update-name-${index}" />
    <input type="text" value="${song.artist}" id="update-artist-${index}" />
    <input type="text" value="${song.album || ''}" id="update-album-${index}" />
    <input type="text" value="${song.genre || ''}" id="update-genre-${index}" />
    <input type="number" value="${song.duration}" readonly />
    <div class="song-actions">
      <button class="action-button update-btn" onclick="updateSong(${index})">Save</button>
      <button class="action-button remove-btn" onclick="fetchSongs()">Cancel</button>
    </div>
  `;

  songListDiv.appendChild(songRow);
}

// Update a song
function updateSong(index) {
  const song = songs[index];
  const updatedSong = {
    name: document.getElementById(`update-name-${index}`).value,
    artist: document.getElementById(`update-artist-${index}`).value,
    album: document.getElementById(`update-album-${index}`).value,
    genre: document.getElementById(`update-genre-${index}`).value,
    duration: song.duration, // Duration is readonly
  };

  fetch(`/upload/update/${song.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedSong),
  })
    .then(response => {
      if (response.ok) {
        fetchSongs(); // Refresh the list
      } else {
        alert('Failed to update the song.');
      }
    })
    .catch(error => console.error('Error updating song:', error));
}

// Initialize the page
fetchSongs();