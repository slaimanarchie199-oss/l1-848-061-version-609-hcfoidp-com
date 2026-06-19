(function () {
  var frame = document.querySelector('[data-player-frame]');

  if (!frame) {
    return;
  }

  var video = frame.querySelector('video');
  var overlay = frame.querySelector('[data-play-layer]');
  var source = frame.getAttribute('data-video-src');
  var hlsInstance = null;

  function markReady() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function loadSource() {
    if (!video || !source || video.dataset.ready === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }

    video.dataset.ready = 'true';
  }

  function startPlayback() {
    loadSource();
    markReady();

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        markReady();
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.dataset.ready !== 'true') {
        startPlayback();
      }
    });

    video.addEventListener('play', markReady);
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
