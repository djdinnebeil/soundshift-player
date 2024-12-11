let currentSongIndex = null;
let songs = [];
let currentSongCard = null;


function loadSong(songIndex)
{
  if (songIndex < 0 || songIndex >= songs.length) {
    console.error('Invalid song index');
    return;
  }

  currentSongIndex = songIndex;
  const song = songs[songIndex];

  if (!song) {
    console.error('Song not found');
    return;
  }

  console.log(`Loading song: ${song.name} by ${song.artist} from ${song.file_url}`);

  const audioPlayer = document.getElementById('audio-player');
  const audioSource = document.getElementById('audio-source');
  const songInfo = document.getElementById('song-info');

  audioSource.src = song.file_url;
  audioPlayer.load();

  audioPlayer.play().then(() => {
    console.log('Playback started');
  }).catch(error => {
    console.error('Playback failed:', error);
  });

  songInfo.textContent = `${song.name} by ${song.artist}`;

  // Update the background color and text of the currently playing song
  if (currentSongCard) {
    currentSongCard.classList.remove('playing'); // Remove 'playing' class from previous card
    const nowPlayingSpan = currentSongCard.querySelector('.now-playing');
    if (nowPlayingSpan) {
      nowPlayingSpan.remove(); // Remove "Now Playing" label
    }
  }
  currentSongCard = document.querySelector(`.song-card-row[data-song-id="${song.id}"]`);
  if (currentSongCard) {
    currentSongCard.classList.add('playing'); // Add 'playing' class
    const nowPlayingSpan = document.createElement('span');
    nowPlayingSpan.className = 'now-playing';
    nowPlayingSpan.textContent = 'Now Playing';
    currentSongCard.querySelector('.song-details').appendChild(nowPlayingSpan);
  }

  fetch(`/songs/play/${song.id}`, {method: 'POST'})
    .then(response => response.json())
    .then(data => console.log(`Play count updated: ${data.play_count}`))
    .catch(error => console.error('Error updating play count:', error));
}

function nextSong()
{
  if (currentSongIndex === null || songs.length === 0) {
    console.log('No song is playing. Playing the first song.');
    loadSong(0);
    return;
  }

  if (currentSongIndex + 1 === songs.length) {
    console.log('End of playlist');
    // Clear the "Now Playing" label and class from the current song card
    if (currentSongCard) {
      currentSongCard.classList.remove('playing'); // Remove the "playing" style
      const nowPlayingLabel = currentSongCard.querySelector('.now-playing');
      if (nowPlayingLabel) nowPlayingLabel.remove(); // Remove the "Now Playing" label
      currentSongCard = null; // Reset the current song card reference
    }

    stopPlayback();
    currentSongIndex = -1;
    return;
  }
  let nextIndex = (currentSongIndex + 1) % songs.length;

  while (!songs[nextIndex]) {
    nextIndex = (nextIndex + 1) % songs.length;
    if (nextIndex === currentSongIndex) {
      console.log('No more valid songs to play.');
      stopPlayback();
      return;
    }
  }

  loadSong(nextIndex);
}

function previousSong()
{
  if (currentSongIndex === null || songs.length === 0) {
    console.log('No song is playing. Playing the last song.');
    loadSong(songs.length - 1);
    return;
  }

  let prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;

  while (!songs[prevIndex]) {
    prevIndex = (prevIndex - 1 + songs.length) % songs.length;
    if (prevIndex === currentSongIndex) {
      console.log('No more valid songs to play.');
      stopPlayback();
      return;
    }
  }

  loadSong(prevIndex);
}

function stopPlayback()
{
  const audioPlayer = document.getElementById('audio-player');
  const audioSource = document.getElementById('audio-source');
  const songInfo = document.getElementById('song-info');
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  audioSource.src = '';
  audioPlayer.load(); // Ensure the cleared source is reflected
  songInfo.textContent = 'Select a song to play';
  currentSongIndex = null;
}

function removeSong(songId)
{
  if (!confirm('Are you sure you want to delete this song?')) {
    return;
  }
  let currentSongId = songs[currentSongIndex]?.id
  fetch(`/upload/remove/${songId}`, {method: 'GET'})
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

      if (currentSongId === songId || currentSongId === 'undefined') {
        console.log('current song removed');
        stopPlayback();

      }
      // Check if the removed song is currently playing
      if (currentSongIndex !== null && songs[currentSongIndex]?.id === songId) {
        console.log('Currently playing song was removed. Stopping playback.');
        stopPlayback();
      }
    })
    .catch(error => {
      console.error('Error removing song:', error);
      alert('Failed to remove the song. Please try again.');
    });
}

// Fetch songs for the current user
fetch('/songs/current')
  .then(response => response.json())
  .then(data => {
    songs = data; // Store the user's songs globally
    renderSongs(data);
  })
  .catch(error => console.error('Error fetching songs:', error));

function renderSongs(songs)
{
  const songsGrid = document.querySelector('.songs-grid');
  songsGrid.innerHTML = ''; // Clear existing content

  if (songs.length === 0 || songs === 'undefined') {
    songsGrid.innerHTML = '<p>No songs added.</p>';
  } else {
    songs.forEach((song, index) => {
      const songCardRow = document.createElement('div');
      songCardRow.className = 'song-card-row';
      songCardRow.dataset.songId = song.id;
      songCardRow.innerHTML = `
                <div class="song-card">
                    <button onclick="loadSong(${index})" class="play-button">
                        <div class="song-details">
                            <span class="song-name">${song.name}<span class="song-artist"> by ${song.artist}</span></span>&nbsp;

                        </div>
                    </button>
                </div>
                &nbsp;
                <button onclick="removeSong(${song.id})" class="remove-button">Delete</button>
            `;

      songsGrid.appendChild(songCardRow);
    });
  }
}


// Automatically play the next song when the current song ends
document.getElementById('audio-player').addEventListener('ended', () => {
  console.log('Song ended. Playing the next song.');
  nextSong();
});
