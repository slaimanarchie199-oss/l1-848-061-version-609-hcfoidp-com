(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    if (!toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
    });
  }

  function initImages() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (slides.length < 2) {
      return;
    }
    var active = 0;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    window.setInterval(function () {
      show(active + 1);
    }, 6500);
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var search = panel.querySelector("[data-filter-search]");
    var year = panel.querySelector("[data-filter-year]");
    var region = panel.querySelector("[data-filter-region]");
    var type = panel.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (initialQuery && search) {
      search.value = initialQuery;
    }

    function includesText(value, query) {
      return String(value || "").toLowerCase().indexOf(query) !== -1;
    }

    function apply() {
      var q = search ? search.value.trim().toLowerCase() : "";
      var y = year ? year.value : "";
      var r = region ? region.value : "";
      var t = type ? type.value : "";
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        var matched = true;
        if (q && !includesText(haystack, q)) {
          matched = false;
        }
        if (y && card.getAttribute("data-year") !== y) {
          matched = false;
        }
        if (r && card.getAttribute("data-region") !== r) {
          matched = false;
        }
        if (t && card.getAttribute("data-type") !== t) {
          matched = false;
        }
        card.classList.toggle("is-hidden", !matched);
      });
    }

    [search, year, region, type].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener("input", apply);
      control.addEventListener("change", apply);
    });
    apply();
  }

  function initPlayer() {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play]");
    var state = player.querySelector("[data-player-state]");
    if (!video) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var hlsInstance = null;
    var started = false;

    function setState(message) {
      if (state) {
        state.textContent = message || "";
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          setState("请再次点击播放");
        });
      }
    }

    function start() {
      if (!stream) {
        setState("当前视频暂时无法播放");
        return;
      }
      if (started) {
        playVideo();
        return;
      }
      started = true;
      player.classList.add("is-loading");
      setState("正在加载");
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          autoStartLoad: true,
          capLevelToPlayerSize: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          player.classList.remove("is-loading");
          player.classList.add("is-ready");
          setState("");
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setState("当前视频暂时无法播放");
          }
        });
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.addEventListener("loadedmetadata", function () {
          player.classList.remove("is-loading");
          player.classList.add("is-ready");
          setState("");
          playVideo();
        }, { once: true });
        video.load();
        return;
      }
      setState("当前视频暂时无法播放");
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        start();
      });
    }
    video.addEventListener("click", function () {
      if (!started || video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      player.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      player.classList.remove("is-playing");
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initMenu();
    initImages();
    initHero();
    initFilters();
    initPlayer();
  });
})();
