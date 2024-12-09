  const audioPlayer = document.getElementById('audio-player');
  const songsGrid = document.getElementById('songs-grid');
  const songs = initialSongs;
  let currentSongIndex = null;

  function renderSongs()
  {
    songsGrid.innerHTML = ''; // Clear existing content

    songs.forEach((song, index) => {
      const songCardRow = document.createElement('div');
      songCardRow.className = 'song-card-row';
      songCardRow.id = `song-${index}`; // Use index to ensure uniqueness
      songCardRow.innerHTML = `
            <div class="song-card">
                <button onclick="loadSong(${index})" class="play-button">
                    <div class="song-details">
                        <span class="song-name">${song.name}<span class="song-artist"> by ${song.artist}</span></span>
                    </div>
                </button>
            </div>&nbsp;&nbsp;
            <button onclick="removeSong(${song.id}, ${song.song_order})" class="remove-button">Remove</button>
        `;
      songsGrid.appendChild(songCardRow);
    });
  }

  let currentSongCard = null; // Track the current playing song card

  function loadSong(songIndex)
  {
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
    const audioSource = document.getElementById('audio-source');
    const songInfo = document.getElementById('song-info');

    // Update audio player source and start playback
    audioPlayer.pause();
    audioSource.src = song.file_url;
    audioPlayer.load();
    audioPlayer.play().catch(err => console.error('Playback error:', err));
    songInfo.textContent = `${song.name} by ${song.artist}`;

    // Update the play count via a backend request
    fetch(`/songs/play/${song.id}`, {method: 'POST'})
      .then(response => response.json())
      .then(data => console.log(`Play count updated: ${data.play_count}`))
      .catch(error => console.error('Error updating play count:', error));

    // Update the current song card
    if (currentSongCard) {
      currentSongCard.classList.remove('playing'); // Remove the "playing" style from the previous card
      const nowPlayingLabel = currentSongCard.querySelector('.now-playing');
      if (nowPlayingLabel) nowPlayingLabel.remove(); // Remove the "Now Playing" label
    }

    currentSongCard = document.querySelector(`#song-${songIndex}`); // Use the unique index
    if (currentSongCard) {
      currentSongCard.classList.add('playing'); // Add the "playing" style to the current card
      const nowPlayingLabel = document.createElement('span');
      nowPlayingLabel.className = 'now-playing';
      nowPlayingLabel.textContent = 'Now Playing';
      currentSongCard.querySelector('.song-details').appendChild(nowPlayingLabel);
    }
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

  function removeSong(songId, songOrder)
  {
    if (!confirm('Are you sure you want to remove this song?')) {
      return;
    }

    fetch(`/playlists/${playlistId}/songs/${songId}/${songOrder}`, {method: 'DELETE'})
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.error || 'Failed to remove song');
          });
        }
        return response.json();
      })
      .then(data => {
        console.log(data.message);

        // Remove the song from the array and re-render
        const songIndex = songs.findIndex(song => song.id === songId && song.song_order === songOrder);
        if (songIndex !== -1) {
          songs.splice(songIndex, 1);
        }
        renderSongs();

        // If the current song is removed, stop playback or move to the next song
        if (currentSongIndex === songIndex) {
          stopPlayback();
        }
      })
      .catch(error => {
        console.error('Error removing song:', error);
        alert(error.message);
      });
  }

  // Initial rendering of songs
  renderSongs();

  // Automatically play the next song when the current one ends
  audioPlayer.addEventListener('ended', nextSong);
  loadSong(0);
