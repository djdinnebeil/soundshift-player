document.getElementById('extract-metadata').addEventListener('click', function () {
    const fileInput = document.getElementById('file');
    const hiddenFileInput = document.getElementById('file-hidden');
    const metadataForm = document.getElementById('metadata-form');

    if (fileInput.files.length === 0) {
      alert('Please select a file.');
      return;
    }

    const file = fileInput.files[0];
    hiddenFileInput.files = fileInput.files; // Sync with hidden input
    // Get the filename without extension
  const fullFilename = file.name;
  const filenameWithoutExtension = fullFilename.substring(0, fullFilename.lastIndexOf('.')) || fullFilename;


    // Extract metadata
    jsmediatags.read(file, {
      onSuccess: function (tag) {
        const { tags } = tag;
        document.getElementById('name').value = tags.title || filenameWithoutExtension;
        document.getElementById('artist').value = tags.artist || '';
        document.getElementById('album').value = tags.album || '';
        document.getElementById('genre').value = tags.genre || 'Unknown';

        // Calculate duration using an audio element
        const audio = document.createElement('audio');
        audio.src = URL.createObjectURL(file);

        audio.addEventListener('loadedmetadata', function () {
          document.getElementById('duration').value = Math.round(audio.duration);
          metadataForm.style.display = 'block';
        });
      },
      onError: function (error) {
        console.error('Error reading metadata:', error);
        alert('Could not extract metadata. Please fill the form manually.');
        metadataForm.style.display = 'block';
      },
    });
  });

  document.getElementById('save-song-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const progressBar = document.getElementById('progress');
    const statusDiv = document.getElementById('upload-status');
    const successMessage = document.getElementById('success-message');
    const songName = document.getElementById('name').value;
    const songArtist = document.getElementById('artist').value;
    const errorMessageDiv = document.getElementById('error-message');

    // Clear error message before submission
    errorMessageDiv.style.display = 'none';
    errorMessageDiv.textContent = '';

    // Show status and reset progress bar
    statusDiv.style.display = 'block';
    progressBar.style.width = '0%';

    try {
      const response = await fetch(this.action, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        progressBar.style.width = '100%';
        successMessage.textContent = `${songName} uploaded successfully!`;
        successMessage.style.display = 'block';

        document.getElementById('name').value = '';
        document.getElementById('artist').value = '';
        document.getElementById('album').value = '';
        document.getElementById('genre').value = '';
        document.getElementById('duration').value = '';
        document.getElementById('metadata-form').style.display = 'none';
        fetchSongs();
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.errors || 'Upload failed. Please try again.';
        const successMessage = document.getElementById('success-message');
        successMessage.style.display = 'none';
        errorMessageDiv.textContent = errorMessage;
        errorMessageDiv.style.display = 'block';
      }
    } catch (error) {
      errorMessageDiv.textContent = 'An unexpected error occurred: ' + error.message;
      errorMessageDiv.style.display = 'block';
    } finally {
      statusDiv.style.display = 'none';
    }
  });

  // Reset error/success messages on file input change
  const fileInput = document.getElementById('file');
  fileInput.addEventListener('change', function () {
    document.getElementById('success-message').style.display = 'none';
    document.getElementById('error-message').style.display = 'none';
  });
