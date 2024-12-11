const selectedSongs = typeof initialSongs !== 'undefined' ? initialSongs : [];
const selectedSongsList = document.getElementById('selected-songs');
const songsInput = document.getElementById('songs-input');

document.querySelectorAll('.add-song-btn').forEach(button => {
  button.addEventListener('click', () => {
    const songId = String(button.dataset.songId);
    const songName = button.dataset.songName;
    const songArtist = button.dataset.songArtist;
    selectedSongs.push({ id: songId, name: songName, artist: songArtist });
    recalculateOrders();
    updateDOMAndInput();
  });
});

function removeSong(songId, songOrder) {
  songId = String(songId);
  const index = selectedSongs.findIndex(song => song.id === songId && song.order === songOrder);
  if (index > -1) {
    selectedSongs.splice(index, 1);
  }
  recalculateOrders();
  updateDOMAndInput();
}

function recalculateOrders() {
  selectedSongs.forEach((song, index) => {
    song.order = index + 1;
  });
}

function updateDOMAndInput() {
  selectedSongsList.innerHTML = '';

  selectedSongs.forEach(song => {
    const songItem = document.createElement('li');
    songItem.dataset.songId = song.id;
    songItem.dataset.order = song.order;
    songItem.innerHTML = `
            ${song.name} by ${song.artist}
            <span class="remove-song-btn" onclick="removeSong('${song.id}', ${song.order})">Remove</span>
        `;
    selectedSongsList.appendChild(songItem);
  });

  songsInput.value = selectedSongs.map(song => `${song.id}:${song.order}`).join(',');
}

// Enable drag-and-drop sorting
new Sortable(selectedSongsList, {
  animation: 150,
  onEnd: () => {
    const newOrder = Array.from(selectedSongsList.children).map((item, index) => {
      const songId = item.dataset.songId;
      return { id: songId, name: item.textContent.split(' by ')[0], artist: '', order: index + 1 };
    });

    selectedSongs.splice(0, selectedSongs.length, ...newOrder);

    recalculateOrders();
    updateDOMAndInput();
  }
});

function validateUniqueOrders() {
  const orders = selectedSongs.map(song => song.order);
  const uniqueOrders = new Set(orders);

  if (orders.length !== uniqueOrders.size) {
    alert("Duplicate song orders are not allowed. Please review the playlist.");
    return false;
  }
  return true;
}

document.querySelector('.playlist-form').addEventListener('submit', (e) => {
  if (!validateUniqueOrders()) {
    e.preventDefault();
  }
});
recalculateOrders();
updateDOMAndInput();
