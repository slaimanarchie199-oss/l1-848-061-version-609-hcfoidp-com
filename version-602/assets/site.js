(function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobile = document.querySelector('.mobile-nav');

    if (toggle && mobile) {
        toggle.addEventListener('click', function () {
            var open = mobile.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function start() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-select]'));
        var container = scope.parentElement || document;
        var items = Array.prototype.slice.call(container.querySelectorAll('.filter-item'));

        if (items.length === 0) {
            items = Array.prototype.slice.call(document.querySelectorAll('.filter-item'));
        }

        function match(item) {
            var query = input ? input.value.trim().toLowerCase() : '';
            var text = [
                item.dataset.title,
                item.dataset.year,
                item.dataset.region,
                item.dataset.genre,
                item.dataset.tags,
                item.dataset.category
            ].join(' ').toLowerCase();

            if (query && text.indexOf(query) === -1) {
                return false;
            }

            return selects.every(function (select) {
                if (!select.value) {
                    return true;
                }
                var field = select.getAttribute('data-filter-select');
                var value = select.value.toLowerCase();
                if (field === 'year') {
                    return String(item.dataset.year || '').toLowerCase() === value;
                }
                if (field === 'category') {
                    return String(item.dataset.category || '').toLowerCase() === value;
                }
                if (field === 'genre') {
                    return String(item.dataset.genre || '').toLowerCase().indexOf(value) !== -1;
                }
                return true;
            });
        }

        function apply() {
            items.forEach(function (item) {
                item.classList.toggle('is-hidden', !match(item));
            });
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
    });
}());

var SitePlayer = (function () {
    function init(url) {
        var box = document.querySelector('[data-player]');
        var video = document.getElementById('movie-video');
        var button = document.querySelector('[data-play-button]');
        var started = false;
        var hls = null;

        if (!box || !video || !url) {
            return;
        }

        function begin() {
            if (!started) {
                started = true;
                box.classList.add('is-playing');

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                    video.play();
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls();
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play();
                    });
                    return;
                }

                video.src = url;
            }

            video.play();
        }

        if (button) {
            button.addEventListener('click', begin);
        }

        video.addEventListener('click', function () {
            if (!started) {
                begin();
            }
        });

        video.addEventListener('play', function () {
            box.classList.add('is-playing');
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    return {
        init: init
    };
}());
