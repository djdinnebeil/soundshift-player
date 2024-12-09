function resetPlayCount(historyId)
  {
    if (!confirm('Are you sure you want to reset the play count for this song?')) {
      return;
    }

    const resetButton = document.querySelector(`tr[data-history-id="${historyId}"] .reset-button`);
    if (resetButton) {
      resetButton.disabled = true;
      resetButton.textContent = 'Processing...'; // Show a loading message
    }

    fetch(`/history/reset/${historyId}`, {method: 'POST'})
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.error || 'Failed to reset play count');
          });
        }
        return response.json();
      })
      .then(data => {
        console.log(data.message);
        const playCountCell = document.querySelector(`tr[data-history-id="${historyId}"] .play-count`);
        if (playCountCell) {
          playCountCell.textContent = '0';
        }
        const lastPlayedCell = document.querySelector(`tr[data-history-id="${historyId}"] .last-played`);
        if (lastPlayedCell) {
          lastPlayedCell.textContent = '';
        }

        if (resetButton) {
          resetButton.textContent = 'Reset Play Count';
          resetButton.disabled = true;
          resetButton.classList.add('reset-button-disabled');
          resetButton.classList.remove('reset-button');
        }
      })
      .catch(error => {
        console.error('Error resetting play count:', error);
        alert('Failed to reset play count. Please try again.');

        if (resetButton) {
          resetButton.disabled = false;
          resetButton.textContent = 'Reset Play Count';
        }
      });
  }


  function removeFromHistory(historyId)
  {
    if (!confirm('Are you sure you want to remove this song from your history?')) {
      return;
    }

    fetch(`/history/remove/${historyId}`, {method: 'DELETE'})
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.error || 'Failed to remove song from history');
          });
        }
        return response.json();
      })
      .then(data => {
        console.log(data.message);
        // Remove the row from the table
        const row = document.querySelector(`tr[data-history-id="${historyId}"]`);
        if (row) {
          row.remove();
        }
      })
      .catch(error => {
        console.error('Error removing song from history:', error);
        alert('Failed to remove song. Please try again.');
      });
  }
