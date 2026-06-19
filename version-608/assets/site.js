document.addEventListener("DOMContentLoaded", function () {
  var navToggle = document.querySelector("[data-nav-toggle]");
  var navMenu = document.querySelector("[data-nav-menu]");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      navMenu.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function showSlide(nextIndex) {
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }
  });

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var root = panel.parentElement || document;
    var searchInput = panel.querySelector("[data-card-search]");
    var yearSelect = panel.querySelector("[data-year-filter]");
    var countBox = panel.querySelector("[data-filter-count]");
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));

    function getCardText(card) {
      return [
        card.dataset.title || "",
        card.dataset.year || "",
        card.dataset.region || "",
        card.dataset.genre || "",
        card.dataset.tags || ""
      ].join(" ").toLowerCase();
    }

    function applyFilter() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = getCardText(card);
        var yearMatched = !year || card.dataset.year === year;
        var queryMatched = !query || text.indexOf(query) !== -1;
        var show = yearMatched && queryMatched;
        card.classList.toggle("is-hidden", !show);
        if (show) {
          visible += 1;
        }
      });

      if (countBox) {
        countBox.textContent = visible + " / " + cards.length;
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get("q");
    if (queryFromUrl && searchInput) {
      searchInput.value = queryFromUrl;
    }

    applyFilter();
  });
});
