(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function textOf(card) {
    return [
      card.dataset.title,
      card.dataset.year,
      card.dataset.region,
      card.dataset.genre,
      card.dataset.tags,
      card.textContent
    ].join(" ").toLowerCase();
  }

  function applyFilter(value) {
    var keyword = String(value || "").trim().toLowerCase();
    var cards = document.querySelectorAll("[data-card]");
    cards.forEach(function (card) {
      var matched = !keyword || textOf(card).indexOf(keyword) !== -1;
      card.classList.toggle("hidden-by-filter", !matched);
    });
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
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

  function setupFilters() {
    var inputs = document.querySelectorAll("[data-page-filter]");
    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        applyFilter(input.value);
      });
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (query) {
      inputs.forEach(function (input) {
        input.value = query;
      });
      applyFilter(query);
    }

    var localForms = document.querySelectorAll("[data-local-search-form]");
    localForms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (input) {
          event.preventDefault();
          applyFilter(input.value);
          history.replaceState(null, "", "?q=" + encodeURIComponent(input.value));
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
