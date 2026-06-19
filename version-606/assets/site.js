(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
        show(0);
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupPageSearch() {
        var inputs = document.querySelectorAll('[data-page-search]');
        if (!inputs.length) {
            return;
        }
        inputs.forEach(function (input) {
            input.addEventListener('input', function () {
                var keyword = normalize(input.value);
                var cards = document.querySelectorAll('[data-movie-card]');
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-category'),
                        card.textContent
                    ].join(' '));
                    card.classList.toggle('is-hidden-by-search', keyword && haystack.indexOf(keyword) === -1);
                });
            });
        });
    }

    function setupGlobalSearch() {
        var input = document.querySelector('[data-global-search]');
        var box = document.querySelector('[data-global-results]');
        if (!input || !box || !window.MOVIE_SEARCH_DATA) {
            return;
        }

        function render(items) {
            if (!items.length) {
                box.innerHTML = '<div class="empty-state">没有找到匹配影片，请尝试更换关键词。</div>';
                return;
            }
            box.innerHTML = items.slice(0, 80).map(function (item) {
                return [
                    '<article class="search-result-card">',
                    '    <h3><a href="' + item.href + '">' + item.title + '</a></h3>',
                    '    <p>' + item.description + '</p>',
                    '    <div class="movie-meta"><span>' + item.year + '</span><span>' + item.region + '</span><span>' + item.genre + '</span></div>',
                    '</article>'
                ].join('');
            }).join('');
        }

        input.addEventListener('input', function () {
            var keyword = normalize(input.value);
            if (!keyword) {
                box.innerHTML = '<div class="empty-state">请输入关键词开始搜索。</div>';
                return;
            }
            var result = window.MOVIE_SEARCH_DATA.filter(function (item) {
                return normalize(item.searchText).indexOf(keyword) !== -1;
            });
            render(result);
        });
    }

    function setupPlayers() {
        var players = document.querySelectorAll('.movie-player');
        players.forEach(function (video) {
            var source = video.getAttribute('data-src');
            var button = video.parentElement ? video.parentElement.querySelector('[data-play-button]') : null;
            var initialized = false;

            function initAndPlay() {
                if (!source) {
                    return;
                }
                if (!initialized) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = source;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                    } else {
                        video.src = source;
                    }
                    initialized = true;
                }
                if (button) {
                    button.classList.add('hidden');
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (button) {
                            button.classList.remove('hidden');
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener('click', initAndPlay);
            }
            video.addEventListener('click', function () {
                if (!initialized) {
                    initAndPlay();
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('hidden');
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupPageSearch();
        setupGlobalSearch();
        setupPlayers();
    });
})();
