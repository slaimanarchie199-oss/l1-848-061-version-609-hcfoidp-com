(function () {
  var importedHls = null;
  var scriptElement = document.currentScript;
  var assetBase = scriptElement ? new URL(".", scriptElement.src).href : "./assets/";

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls || null);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (importedHls) {
      return importedHls;
    }
    importedHls = import(assetBase + "hls-vendor-dru42stk.js")
      .then(function (module) {
        return module.H || module.default || window.Hls || null;
      })
      .catch(function () {
        return loadScript("https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js");
      });
    return importedHls;
  }

  function canUseNative(video) {
    return video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");
  }

  function attach(video, stream) {
    if (video.dataset.ready === "1") {
      return Promise.resolve();
    }
    video.dataset.ready = "1";
    if (canUseNative(video)) {
      video.src = stream;
      return Promise.resolve();
    }
    return loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = stream;
      }
    }).catch(function () {
      video.src = stream;
    });
  }

  function start(box) {
    var video = box.querySelector("video[data-stream]");
    var button = box.querySelector("[data-play-button]");
    if (!video) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    if (!stream) {
      return;
    }
    if (button) {
      button.classList.add("is-hidden");
    }
    video.controls = true;
    attach(video, stream).then(function () {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    });
  }

  function setup() {
    var boxes = document.querySelectorAll("[data-video-box]");
    boxes.forEach(function (box) {
      var button = box.querySelector("[data-play-button]");
      var video = box.querySelector("video[data-stream]");
      if (button) {
        button.addEventListener("click", function () {
          start(box);
        });
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.dataset.ready !== "1" || video.paused) {
            start(box);
          }
        });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
})();
