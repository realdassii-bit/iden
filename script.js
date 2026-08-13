/* ============================================
   IDEN — SONIC UNIVERSE
   Clean, accessible, dependency-free JavaScript
   ============================================ */
(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const body = document.body;
  const preloader = $('#preloader');
  const navbar = $('#navbar');
  const menuBtn = $('#menuBtn');
  const navOverlay = $('#navOverlay');
  const navLinks = $$('.nav-link');

  // Preloader: short, non-blocking, and safe for cached pages.
  const hidePreloader = () => preloader && preloader.classList.add('hidden');
  window.addEventListener('load', () => setTimeout(hidePreloader, 700), { once: true });
  setTimeout(hidePreloader, 2200);

  // Reduced-motion support.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Background particles: pause when the tab is hidden and disable for reduced motion.
  const canvas = $('#particlesCanvas');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticle() {
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.4 + 0.3,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        opacity: Math.random() * 0.25 + 0.05
      };
    }

    function resetParticles() {
      const count = window.innerWidth < 700 ? 22 : 45;
      particles = Array.from({ length: count }, makeParticle);
    }

    function draw() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -5 || p.x > window.innerWidth + 5 || p.y < -5 || p.y > window.innerHeight + 5) {
          Object.assign(p, makeParticle());
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,164,92,${p.opacity})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(draw);
    }

    resizeCanvas();
    resetParticles();
    window.addEventListener('resize', () => { resizeCanvas(); resetParticles(); }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(animationId);
      else draw();
    });
    draw();
  } else if (canvas) {
    canvas.style.display = 'none';
  }

  // Navbar state.
  const updateNavbar = () => navbar && navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateNavbar();
  window.addEventListener('scroll', updateNavbar, { passive: true });

  // Mobile menu with proper accessibility state.
  let menuOpen = false;
  function setMenu(open) {
    menuOpen = open;
    menuBtn?.classList.toggle('active', open);
    navOverlay?.classList.toggle('active', open);
    menuBtn?.setAttribute('aria-expanded', String(open));
    body.style.overflow = open ? 'hidden' : '';
  }

  menuBtn?.setAttribute('aria-expanded', 'false');
  menuBtn?.addEventListener('click', e => {
    e.stopPropagation();
    setMenu(!menuOpen);
  });
  navLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));
  navOverlay?.addEventListener('click', e => {
    if (e.target === navOverlay || e.target.classList.contains('nav-overlay-bg')) setMenu(false);
  });

  // Typewriter.
  const typewriter = $('#typewriter');
  const texts = [
    'آهنگساز، پرودیوسر و هنرمند مستقل',
    'با IDEN، صداهای متفاوتی می‌شنوی',
    'IDEN You Are Crazy'
  ];
  let textIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function typeWriter() {
    if (!typewriter) return;
    const current = texts[textIndex];
    if (deleting) charIndex--; else charIndex++;
    typewriter.textContent = current.slice(0, charIndex);
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    typewriter.appendChild(cursor);

    let delay = deleting ? 35 : 65;
    if (!deleting && charIndex >= current.length) { deleting = true; delay = 1800; }
    else if (deleting && charIndex <= 0) { deleting = false; textIndex = (textIndex + 1) % texts.length; delay = 450; }
    window.setTimeout(typeWriter, delay);
  }
  if (typewriter) typeWriter();

  // Scroll reveal.
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(el => observer.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('is-visible'));
  }

  // Audio / track popup.
  const popup = $('#platformPopup');
  const overlay = $('#popupOverlay');
  const closeBtn = $('#popupClose');
  const trackName = $('#popupTrackName');
  const audio = $('#audioPlayer');
  const cover = $('.player-mini-cover img');
  const playBtn = $('#playerPlayBtn');
  const playIcon = $('#playIcon');
  const progress = $('#playerProgress');
  const progressFill = $('#playerProgressFill');
  const currentTime = $('#currentTime');
  const totalTime = $('#totalTime');
  const muteBtn = $('#playerMuteBtn');
  const muteIcon = $('#muteIcon');
  const visualizer = $('#visualizer');
  let playing = false;
  let muted = false;

  const formatTime = seconds => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  function syncPlayer() {
    playing = !audio?.paused;
    playBtn?.classList.toggle('playing', playing);
    if (playIcon) playIcon.textContent = playing ? '⏸' : '▶';
    visualizer?.classList.toggle('active', playing);
  }

  function openPopup(name, coverSrc, audioSrc) {
    if (!popup) return;
    if (trackName) trackName.textContent = name;
    if (cover && coverSrc) cover.src = coverSrc;
    if (audio && audioSrc) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = audioSrc;
      audio.load();
    }
    if (progressFill) progressFill.style.width = '0%';
    if (currentTime) currentTime.textContent = '0:00';
    if (totalTime) totalTime.textContent = '0:00';
    popup.style.display = 'flex';
    body.style.overflow = 'hidden';
    closeBtn?.focus();
  }

  function closePopup() {
    if (!popup) return;
    popup.style.display = 'none';
    body.style.overflow = menuOpen ? 'hidden' : '';
    audio?.pause();
    if (audio) audio.currentTime = 0;
    syncPlayer();
    if (progressFill) progressFill.style.width = '0%';
    if (currentTime) currentTime.textContent = '0:00';
  }

  $('#trackCover1')?.addEventListener('click', () => openPopup(
    'Fuck The Police',
    'https://i.ibb.co/mCrXy88Q/Cover.png',
    'test-music.wav'
  ));

  $$('.track-card').forEach(card => card.addEventListener('click', () => openPopup(
    card.dataset.track || 'Track', card.dataset.cover || '', card.dataset.audio || ''
  )));

  overlay?.addEventListener('click', closePopup);
  closeBtn?.addEventListener('click', closePopup);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && popup?.style.display === 'flex') closePopup();
    if (e.key === ' ' && popup?.style.display === 'flex' && document.activeElement?.tagName !== 'BUTTON') {
      e.preventDefault(); playBtn?.click();
    }
    if (e.key.toLowerCase() === 'm' && popup?.style.display === 'flex') muteBtn?.click();
  });

  playBtn?.addEventListener('click', async () => {
    if (!audio) return;
    if (audio.paused) {
      try { await audio.play(); } catch (err) { console.warn('Playback unavailable:', err); }
    } else audio.pause();
    syncPlayer();
  });

  audio?.addEventListener('timeupdate', () => {
    const duration = audio.duration || 0;
    if (progressFill) progressFill.style.width = duration ? `${(audio.currentTime / duration) * 100}%` : '0%';
    if (currentTime) currentTime.textContent = formatTime(audio.currentTime);
    if (totalTime) totalTime.textContent = formatTime(duration);
  });
  audio?.addEventListener('loadedmetadata', () => { if (totalTime) totalTime.textContent = formatTime(audio.duration); });
  audio?.addEventListener('play', syncPlayer);
  audio?.addEventListener('pause', syncPlayer);
  audio?.addEventListener('ended', () => { if (progressFill) progressFill.style.width = '0%'; if (currentTime) currentTime.textContent = '0:00'; syncPlayer(); });
  audio?.addEventListener('error', () => { syncPlayer(); console.warn('Audio could not be loaded.'); });

  progress?.addEventListener('click', e => {
    if (!audio?.duration) return;
    const rect = progress.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
  });

  muteBtn?.addEventListener('click', () => {
    if (!audio) return;
    muted = !muted;
    audio.muted = muted;
    if (muteIcon) muteIcon.textContent = muted ? '🔇' : '🔊';
    muteBtn.setAttribute('aria-label', muted ? 'فعال کردن صدا' : 'بی‌صدا کردن');
  });

  // Easter egg.
  const eggTrigger = $('#easterEggTrigger');
  const egg = $('#easterEgg');
  let eggTimer;
  eggTrigger?.addEventListener('click', () => {
    egg?.classList.add('show');
    clearTimeout(eggTimer);
    eggTimer = setTimeout(() => egg?.classList.remove('show'), 3000);
  });
})();


// ========== IDEN ACCESS PROTECTION ==========
(function () {
    'use strict';

    var accessToast = null;
    var toastTimer = null;

    function showAccessDenied() {
        if (!accessToast) {
            accessToast = document.createElement('div');
            accessToast.className = 'iden-access-denied';
            accessToast.setAttribute('role', 'alert');
            accessToast.innerHTML =
                '<div class="iden-access-icon">!</div>' +
                '<div><strong>ACCESS DENIED</strong><span>شما دسترسی ندارید</span></div>';
            document.body.appendChild(accessToast);
        }

        requestAnimationFrame(function () {
            accessToast.classList.add('show');
        });

        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            accessToast.classList.remove('show');
        }, 2600);
    }

    // Right click
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        showAccessDenied();
    }, true);

    // F12 / DevTools shortcuts
    document.addEventListener('keydown', function (e) {
        var key = (e.key || '').toLowerCase();
        var blocked =
            key === 'f12' ||
            (e.ctrlKey && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
            (e.ctrlKey && key === 'u');

        if (blocked) {
            e.preventDefault();
            e.stopPropagation();
            showAccessDenied();
            return false;
        }
    }, true);
})();


// ========== IDEN // SONIC PLAYER PRO CONTROLS ==========
(function () {
    var audio = document.getElementById('audioPlayer');
    var nextBtn = document.getElementById('playerNextBtn');
    var prevBtn = document.getElementById('playerPrevBtn');
    var shuffleBtn = document.getElementById('playerShuffleBtn');
    var repeatBtn = document.getElementById('playerRepeatBtn');
    var volume = document.getElementById('playerVolume');
    var titleEl = document.getElementById('playerTrackTitle');
    var indexEl = document.getElementById('playerTrackIndex');
    var list = document.querySelectorAll('.iden-playlist-item[data-track-index]');
    var repeat = false;
    var shuffle = false;
    var current = 0;

    var tracks = [
        {
            name: 'Fuck The Police',
            cover: 'https://i.ibb.co/mCrXy88Q/Cover.png',
            audio: 'test-music.wav'
        }
    ];

    function setTrack(i, autoplay) {
        if (!audio || !tracks[i]) return;
        current = i;
        var t = tracks[i];
        audio.pause();
        audio.currentTime = 0;
        audio.src = t.audio;
        audio.load();
        if (titleEl) titleEl.textContent = t.name;
        if (indexEl) indexEl.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(tracks.length).padStart(2, '0');

        list.forEach(function (item) {
            item.classList.toggle('active', Number(item.getAttribute('data-track-index')) === i);
        });

        var cover = document.querySelector('.player-mini-cover img');
        if (cover) {
            cover.src = t.cover;
            cover.alt = t.name;
        }

        if (autoplay) {
            audio.play().then(function () {
                if (typeof isPlaying !== 'undefined') isPlaying = true;
                if (playBtn) playBtn.classList.add('playing');
                if (playIcon) playIcon.textContent = '⏸';
                if (visualizer) visualizer.classList.add('active');
            }).catch(function () {});
        }
    }

    if (volume && audio) {
        audio.volume = 1;
        volume.addEventListener('input', function () {
            audio.volume = Number(this.value);
            audio.muted = audio.volume === 0;
            if (muteIcon) muteIcon.textContent = audio.muted ? '🔇' : '🔊';
        });
    }

    if (nextBtn) nextBtn.addEventListener('click', function () {
        var next = shuffle ? Math.floor(Math.random() * tracks.length) : (current + 1) % tracks.length;
        setTrack(next, true);
    });

    if (prevBtn) prevBtn.addEventListener('click', function () {
        if (audio && audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }
        var prev = (current - 1 + tracks.length) % tracks.length;
        setTrack(prev, true);
    });

    if (shuffleBtn) shuffleBtn.addEventListener('click', function () {
        shuffle = !shuffle;
        this.classList.toggle('active', shuffle);
        this.setAttribute('aria-pressed', String(shuffle));
    });

    if (repeatBtn) repeatBtn.addEventListener('click', function () {
        repeat = !repeat;
        this.classList.toggle('active', repeat);
        this.setAttribute('aria-pressed', String(repeat));
    });

    list.forEach(function (item) {
        item.addEventListener('click', function () {
            setTrack(Number(this.getAttribute('data-track-index')), false);
            if (platformPopup && platformPopup.style.display !== 'flex') {
                platformPopup.style.display = 'flex';
                platformPopup.style.alignItems = 'center';
                platformPopup.style.justifyContent = 'center';
                document.body.style.overflow = 'hidden';
            }
        });
    });

    if (audio) {
        audio.addEventListener('ended', function () {
            if (repeat) {
                setTrack(current, true);
            } else {
                var next = shuffle ? Math.floor(Math.random() * tracks.length) : (current + 1) % tracks.length;
                if (tracks.length > 1) setTrack(next, true);
                else {
                    if (playIcon) playIcon.textContent = '▶';
                    if (visualizer) visualizer.classList.remove('active');
                    if (typeof isPlaying !== 'undefined') isPlaying = false;
                }
            }
        });
    }
})();


// ============================================================
// IDEN // MOTION ENGINE
// ============================================================
(function () {
    'use strict';

    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Cinematic loader
    var loader = document.createElement('div');
    loader.className = 'iden-motion-loader';
    loader.innerHTML =
        '<div class="iden-loader-inner">' +
            '<div class="iden-loader-logo">I D E N</div>' +
            '<div class="iden-loader-line"></div>' +
            '<div class="iden-loader-text">ENTER THE SONIC UNIVERSE</div>' +
        '</div>';
    document.body.appendChild(loader);

    if (!reduceMotion) {
        window.addEventListener('load', function () {
            setTimeout(function () {
                loader.classList.add('done');
            }, 650);
        });
    } else {
        loader.remove();
    }

    // Atmospheric grain
    if (!reduceMotion) {
        var noise = document.createElement('div');
        noise.className = 'iden-noise';
        document.body.appendChild(noise);
    }

    // Scroll progress
    var progress = document.createElement('div');
    progress.className = 'iden-scroll-progress';
    document.body.appendChild(progress);

    function updateProgress() {
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    if (reduceMotion) return;

    // Cursor atmosphere (desktop only)
    if (window.matchMedia('(pointer:fine)').matches) {
        var glow = document.createElement('div');
        glow.className = 'iden-cursor-glow';
        document.body.appendChild(glow);

        var gx = window.innerWidth / 2;
        var gy = window.innerHeight / 2;
        var tx = gx, ty = gy;

        window.addEventListener('pointermove', function (e) {
            tx = e.clientX;
            ty = e.clientY;
        }, { passive: true });

        function moveGlow() {
            gx += (tx - gx) * .09;
            gy += (ty - gy) * .09;
            glow.style.left = gx + 'px';
            glow.style.top = gy + 'px';
            requestAnimationFrame(moveGlow);
        }
        moveGlow();
    }

    // Add reveal classes to meaningful content
    var selectors = [
        'section > *',
        '.hero-content',
        '.about-content',
        '.about-image',
        '.expertise-card',
        '.track-card',
        '.timeline-item',
        '.social-card',
        '.contact-content'
    ];

    var elements = [];
    selectors.forEach(function (selector) {
        document.querySelectorAll(selector).forEach(function (el) {
            if (el.dataset.motionIgnore !== 'true' && elements.indexOf(el) === -1) {
                elements.push(el);
            }
        });
    });

    elements.forEach(function (el, index) {
        el.classList.add('motion-reveal');
        el.style.setProperty('--motion-delay', Math.min((index % 5) * 70, 280) + 'ms');
    });

    // Section classes
    document.querySelectorAll('section').forEach(function (section) {
        section.classList.add('motion-section');
    });

    // Eyebrow elements
    document.querySelectorAll('.section-subtitle, .section-label, .eyebrow').forEach(function (el) {
        el.classList.add('motion-eyebrow');
    });

    // Intersection Observer
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });

        elements.forEach(function (el) { observer.observe(el); });
        document.querySelectorAll('section, .motion-eyebrow, .timeline').forEach(function (el) {
            observer.observe(el);
        });
    } else {
        elements.forEach(function (el) { el.classList.add('is-visible'); });
    }

    // Lightweight scroll parallax
    var parallaxItems = document.querySelectorAll('[data-parallax]');
    var ticking = false;

    function parallax() {
        var y = window.scrollY;
        parallaxItems.forEach(function (el) {
            var speed = parseFloat(el.getAttribute('data-parallax')) || .08;
            var rect = el.getBoundingClientRect();
            var offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
            el.style.transform = 'translate3d(0,' + (-offset) + 'px,0)';
        });
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(parallax);
            ticking = true;
        }
    }, { passive: true });
    parallax();

    // Magnetic micro-interaction for important buttons
    if (window.matchMedia('(pointer:fine)').matches) {
        document.querySelectorAll('.btn, .hero-cta, .player-btn').forEach(function (btn) {
            btn.addEventListener('pointermove', function (e) {
                var r = btn.getBoundingClientRect();
                var x = e.clientX - r.left - r.width / 2;
                var y = e.clientY - r.top - r.height / 2;
                btn.style.transform = 'translate(' + (x * .08) + 'px,' + (y * .08) + 'px)';
            });
            btn.addEventListener('pointerleave', function () {
                btn.style.transform = '';
            });
        });
    }

    // Add section separator before major sections when possible
    document.querySelectorAll('section').forEach(function (section, index) {
        if (index > 0 && !section.querySelector('.iden-section-line')) {
            var line = document.createElement('div');
            line.className = 'iden-section-line';
            section.insertBefore(line, section.firstChild);
            if ('IntersectionObserver' in window) {
                var lineObs = new IntersectionObserver(function (entries, obs) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                            obs.unobserve(entry.target);
                        }
                    });
                }, { threshold: .2 });
                lineObs.observe(line);
            } else {
                line.classList.add('is-visible');
            }
        }
    });
})();


// ============================================================
// IDEN // LIVE MOTION LAYER
// ============================================================
(function () {
    'use strict';

    var reduced = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) return;

    // Atmospheric layers
    var sweep = document.createElement('div');
    sweep.className = 'iden-live-sweep';
    document.body.appendChild(sweep);

    var grid = document.createElement('div');
    grid.className = 'iden-live-grid';
    document.body.appendChild(grid);

    // Scroll velocity: a visible but controlled motion response
    var lastY = window.scrollY;
    var velocity = 0;
    var scrollTimer;

    window.addEventListener('scroll', function () {
        var current = window.scrollY;
        velocity = Math.max(-18, Math.min(18, current - lastY));
        lastY = current;

        document.documentElement.style.setProperty(
            '--iden-scroll-velocity',
            Math.abs(velocity)
        );

        document.body.classList.toggle('iden-scrolling-fast', Math.abs(velocity) > 8);

        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function () {
            document.body.classList.remove('iden-scrolling-fast');
        }, 120);
    }, { passive: true });

    // Make important headings react subtly to scroll.
    var hero = document.querySelector('.hero-title');
    if (hero) {
        window.addEventListener('scroll', function () {
            var y = Math.min(window.scrollY, 520);
            hero.style.transform =
                'translate3d(0,' + (y * .08) + 'px,0) scale(' +
                (1 - y * .00008) + ')';
            hero.style.opacity = String(Math.max(.28, 1 - y / 650));
        }, { passive: true });
    }

    // Intersection burst: stronger entrance when a section appears.
    if ('IntersectionObserver' in window) {
        var burstObserver = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('iden-section-live');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: .18 });

        document.querySelectorAll('section').forEach(function (section) {
            burstObserver.observe(section);
        });
    }

    // Tiny 3D tilt for cards on desktop.
    if (window.matchMedia('(pointer:fine)').matches) {
        document.querySelectorAll('.track-card, .expertise-card, .social-card').forEach(function (card) {
            card.addEventListener('pointermove', function (e) {
                var r = card.getBoundingClientRect();
                var px = (e.clientX - r.left) / r.width;
                var py = (e.clientY - r.top) / r.height;
                var rx = (0.5 - py) * 5;
                var ry = (px - 0.5) * 5;

                card.style.transform =
                    'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-10px) scale(1.018)';
            });

            card.addEventListener('pointerleave', function () {
                card.style.transform = '';
            });
        });
    }

    // Animate numeric counters if the page contains them.
    document.querySelectorAll('[data-counter]').forEach(function (el) {
        var target = parseFloat(el.getAttribute('data-counter'));
        if (!isFinite(target)) return;

        var observer = new IntersectionObserver(function (entries, obs) {
            if (!entries[0].isIntersecting) return;

            var start = performance.now();
            var duration = 1100;

            function tick(now) {
                var p = Math.min(1, (now - start) / duration);
                var eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(target * eased);
                if (p < 1) requestAnimationFrame(tick);
            }

            requestAnimationFrame(tick);
            obs.disconnect();
        }, { threshold: .8 });

        observer.observe(el);
    });
})();


// IDEN // Content polish: ignore empty nodes in motion system.
(function () {
    document.querySelectorAll('.motion-reveal').forEach(function (el) {
        if (!el.textContent.trim() && !el.querySelector('img,svg,canvas,a,button')) {
            el.style.display = 'none';
        }
    });
})();
// دریافت عناصر
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playerPlayBtn');
const playIcon = document.getElementById('playIcon');
const currentTimeSpan = document.getElementById('currentTime');
const totalTimeSpan = document.getElementById('totalTime');
const progressFill = document.getElementById('playerProgressFill');
const progressBar = document.getElementById('playerProgress');
const volumeControl = document.getElementById('playerVolume');
const muteBtn = document.getElementById('playerMuteBtn');
const muteIcon = document.getElementById('muteIcon');

// تابع پخش/توقف
playBtn.addEventListener('click', () => {
    if (audioPlayer.paused) {
        audioPlayer.play()
            .then(() => {
                playIcon.textContent = '⏸';
                playBtn.setAttribute('aria-label', 'توقف');
            })
            .catch(error => {
                console.error('خطا در پخش:', error);
                alert('مشکل در پخش فایل صوتی');
            });
    } else {
        audioPlayer.pause();
        playIcon.textContent = '▶';
        playBtn.setAttribute('aria-label', 'پخش');
    }
});

// به‌روزرسانی زمان
audioPlayer.addEventListener('loadedmetadata', () => {
    totalTimeSpan.textContent = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener('timeupdate', () => {
    currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressFill.style.width = progress + '%';
});

// کلیک روی نوار پیشرفت
progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioPlayer.currentTime = percent * audioPlayer.duration;
});

// کنترل صدا
volumeControl.addEventListener('input', () => {
    audioPlayer.volume = volumeControl.value;
    updateMuteIcon();
});

muteBtn.addEventListener('click', () => {
    audioPlayer.muted = !audioPlayer.muted;
    updateMuteIcon();
});

function updateMuteIcon() {
    if (audioPlayer.muted || audioPlayer.volume === 0) {
        muteIcon.textContent = '🔇';
    } else {
        muteIcon.textContent = '🔊';
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// مدیریت خطا
audioPlayer.addEventListener('error', (e) => {
    console.error('خطا در لود فایل صوتی:', e);
    alert('فایل صوتی در دسترس نیست');
});

// لود خودکار اطلاعات
audioPlayer.load();