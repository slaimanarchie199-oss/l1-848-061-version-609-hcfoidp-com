(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var region = document.querySelector("[data-region-filter]");
    var kind = document.querySelector("[data-kind-filter]");
    var empty = document.querySelector("[data-empty-state]");
    if (!input || !cards.length) {
      return;
    }

    function normalized(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var query = normalized(input.value);
      var regionValue = region ? normalized(region.value) : "";
      var kindValue = kind ? normalized(kind.value) : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalized([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-kind"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category")
        ].join(" "));
        var passQuery = !query || haystack.indexOf(query) !== -1;
        var passRegion = !regionValue || normalized(card.getAttribute("data-region")) === regionValue;
        var passKind = !kindValue || normalized(card.getAttribute("data-kind")) === kindValue;
        var pass = passQuery && passRegion && passKind;
        card.style.display = pass ? "" : "none";
        if (pass) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    input.addEventListener("input", apply);
    if (region) {
      region.addEventListener("change", apply);
    }
    if (kind) {
      kind.addEventListener("change", apply);
    }
  }

  window.initMoviePlayer = function (streamUrl) {
    var player = document.getElementById("movie-player");
    var cover = document.querySelector("[data-play-cover]");
    var overlay = document.querySelector("[data-play-overlay]");
    var button = document.querySelector("[data-play-button]");
    var isReady = false;
    var hls = null;

    if (!player || !streamUrl) {
      return;
    }

    function prepare() {
      if (isReady) {
        return;
      }
      if (player.canPlayType("application/vnd.apple.mpegurl")) {
        player.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(player);
      } else {
        player.src = streamUrl;
      }
      isReady = true;
    }

    function showVideo() {
      if (cover) {
        cover.classList.add("is-playing");
      }
    }

    function start() {
      prepare();
      showVideo();
      var playPromise = player.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (button) {
      button.addEventListener("click", start);
    }
    player.addEventListener("play", showVideo);
    player.addEventListener("click", function () {
      if (player.paused) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
