/* ============================================================
   IDEN — SONIC UNIVERSE
   Clean, single-pass, dependency-free JavaScript.
   Rewritten for clarity: one player module, one motion module,
   no duplicate event listeners, no conflicting state.
   ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     ██  اینجا اینسترومنتال‌هاتو اضافه/ویرایش کن  ██
     ==========================================================
     تنها جایی که برای افزودن آهنگ لازم است دستکاری شود همین
     آرایه‌ی TRACKS است. هر آبجکت داخل آرایه یک قطعه است و همین
     ترتیب، ترتیب نمایش در سایت و پلی‌لیست هم خواهد بود.

     title      نام آهنگ                                (الزامی)
     artist     نام هنرمند / زیرعنوان                    (اختیاری)
     cover      لینک مستقیم عکس کاور — jpg / png / webp   (الزامی برای آهنگ‌های واقعی)
     src        لینک مستقیم فایل صوتی — mp3 / wav / ogg   (الزامی برای آهنگ‌های واقعی)
     comingSoon اگر true باشد فقط «به‌زودی» نشان داده می‌شود
                و نیازی به cover/src ندارد.

     ⚠️ نکته‌ی مهم درباره‌ی لینک src:
     باید یک لینک "مستقیم" به فایل صوتی باشد، یعنی وقتی همون
     لینک رو توی یک تب جدید مرورگر باز می‌کنی، فایل صوتی مستقیماً
     پخش/دانلود بشه — نه یک صفحه (مثل صفحه‌ی اسپاتیفای، ساندکلاود
     یا صفحه‌ی معمولی گوگل‌درایو).
     گزینه‌های خوب: GitHub (raw.githubusercontent.com)،
     Cloudflare R2 / Backblaze B2، یا هر هاست فایل مستقیم دیگر.
     اگر از گوگل‌درایو استفاده می‌کنی، لینک باید به شکل زیر باشد
     (نه لینک اشتراک‌گذاری معمولی):
     https://drive.google.com/uc?export=download&id=FILE_ID

     برای اضافه کردن آهنگ جدید، فقط یک آبجکت مثل نمونه‌ی زیر به
     آرایه اضافه کن (و در صورت نیاز یکی از آیتم‌های comingSoon را
     جایگزین/حذف کن):

     {
       title:  'اسم آهنگ',
       artist: 'IDEN · SONIC UNIVERSE',
       cover:  'لینک مستقیم عکس کاور',
       src:    'لینک مستقیم فایل صوتی'
     },
  ============================================================ */
  const TRACKS = [
    {
      title: 'MidNNight',
      artist: 'IDEN',
      cover: 'https://ia600403.us.archive.org/31/items/folder_20260925/folder.png',
      src: 'https://archive.org/download/mid-night/MidNight.mp3'
    },
    { title: 'اثر بعدی', comingSoon: true },
    { title: 'اثر بعدی', comingSoon: true },
    { title: 'اثر بعدی', comingSoon: true },
    { title: 'اثر بعدی', comingSoon: true }
  ];

  /* ============================================================
     UTIL
  ============================================================ */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  const formatTime = seconds => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  /* ============================================================
     PRELOADER
  ============================================================ */
  const preloader = $('#preloader');
  const progressBarLoader = $('#progressBar');
  if (progressBarLoader) {
    let p = 0;
    const step = () => {
      p = Math.min(100, p + (100 - p) * 0.18 + 1);
      progressBarLoader.style.width = p + '%';
      if (p < 100) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const hidePreloader = () => preloader && preloader.classList.add('hidden');
  window.addEventListener('load', () => setTimeout(hidePreloader, 700), { once: true });
  setTimeout(hidePreloader, 2200);

  /* ============================================================
     BACKGROUND PARTICLES (canvas, paused off-screen tab)
  ============================================================ */
  (function particles() {
    const canvas = $('#particlesCanvas');
    if (!canvas) return;
    if (reduceMotion) { canvas.style.display = 'none'; return; }

    const ctx = canvas.getContext('2d');
    let dots = [];
    let raf;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeDot() {
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.6 + 0.3,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.3 + 0.06,
        hue: Math.random() > 0.85 ? '196,30,58' : '200,164,92'
      };
    }

    function reset() {
      const count = window.innerWidth < 700 ? 30 : 60;
      dots = Array.from({ length: count }, makeDot);
    }

    function linkNearby() {
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i], b = dots[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(200,164,92,${0.08 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      dots.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -5 || p.x > window.innerWidth + 5 || p.y < -5 || p.y > window.innerHeight + 5) {
          Object.assign(p, makeDot());
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
        ctx.fill();
      });
      linkNearby();
      raf = requestAnimationFrame(draw);
    }

    resize();
    reset();
    window.addEventListener('resize', () => { resize(); reset(); }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else draw();
    });
    draw();
  })();

  /* ============================================================
     CURSOR GLOW (desktop only)
  ============================================================ */
  if (!reduceMotion && isFinePointer) {
    const glow = document.createElement('div');
    glow.className = 'iden-cursor-glow';
    body.appendChild(glow);
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
    window.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      gx += (tx - gx) * 0.09;
      gy += (ty - gy) * 0.09;
      glow.style.left = gx + 'px';
      glow.style.top = gy + 'px';
      requestAnimationFrame(loop);
    })();
  }

  /* ============================================================
     SCROLL PROGRESS BAR
  ============================================================ */
  (function scrollProgress() {
    const bar = document.createElement('div');
    bar.className = 'iden-scroll-progress';
    body.appendChild(bar);
    function update() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

  /* ============================================================
     NAVBAR + MOBILE MENU
  ============================================================ */
  const navbar = $('#navbar');
  const menuBtn = $('#menuBtn');
  const navOverlay = $('#navOverlay');
  const navLinks = $$('.nav-link');
  let menuOpen = false;

  const updateNavbar = () => navbar && navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateNavbar();
  window.addEventListener('scroll', updateNavbar, { passive: true });

  function setMenu(open) {
    menuOpen = open;
    menuBtn?.classList.toggle('active', open);
    navOverlay?.classList.toggle('active', open);
    menuBtn?.setAttribute('aria-expanded', String(open));
    body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn?.setAttribute('aria-expanded', 'false');
  menuBtn?.addEventListener('click', e => { e.stopPropagation(); setMenu(!menuOpen); });
  navLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));
  navOverlay?.addEventListener('click', e => {
    if (e.target === navOverlay || e.target.classList.contains('nav-overlay-bg')) setMenu(false);
  });

  /* ============================================================
     TYPEWRITER
  ============================================================ */
  (function typewriterFx() {
    const el = $('#typewriter');
    if (!el) return;
    const texts = [
      'آهنگساز، پرودیوسر و هنرمند مستقل',
      'با IDEN، صداهای متفاوتی می‌شنوی',
      'IDEN You Are Crazy'
    ];
    let ti = 0, ci = 0, deleting = false;
    function tick() {
      const current = texts[ti];
      ci += deleting ? -1 : 1;
      el.textContent = current.slice(0, ci);
      const cursor = document.createElement('span');
      cursor.className = 'cursor';
      cursor.setAttribute('aria-hidden', 'true');
      el.appendChild(cursor);
      let delay = deleting ? 35 : 65;
      if (!deleting && ci >= current.length) { deleting = true; delay = 1800; }
      else if (deleting && ci <= 0) { deleting = false; ti = (ti + 1) % texts.length; delay = 450; }
      setTimeout(tick, delay);
    }
    tick();
  })();

  /* ============================================================
     SCROLL REVEAL (single observer for every animated element)
  ============================================================ */
  (function reveal() {
    const selectors = [
      '.reveal', 'section > *', '.hero-content', '.about-content',
      '.expertise-card', '.track-card', '.social-card', '.timeline-item'
    ];
    const seen = new Set();
    const elements = [];
    selectors.forEach(sel => $$(sel).forEach(el => {
      if (!seen.has(el) && el.dataset.motionIgnore !== 'true') { seen.add(el); elements.push(el); }
    }));
    elements.forEach((el, i) => {
      el.classList.add('motion-reveal');
      el.style.setProperty('--motion-delay', Math.min((i % 5) * 70, 280) + 'ms');
    });
    document.querySelectorAll('section').forEach(s => s.classList.add('motion-section'));

    if ('IntersectionObserver' in window && !reduceMotion) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      elements.forEach(el => obs.observe(el));
      document.querySelectorAll('section').forEach(el => obs.observe(el));
    } else {
      elements.forEach(el => el.classList.add('is-visible'));
      document.querySelectorAll('section').forEach(el => el.classList.add('is-visible'));
    }
  })();

  /* ============================================================
     SECTION DIVIDER LINES
  ============================================================ */
  (function sectionLines() {
    document.querySelectorAll('section').forEach((section, i) => {
      if (i === 0 || section.querySelector('.iden-section-line')) return;
      const line = document.createElement('div');
      line.className = 'iden-section-line';
      section.insertBefore(line, section.firstChild);
      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
          });
        }, { threshold: 0.2 });
        obs.observe(line);
      } else line.classList.add('is-visible');
    });
  })();

  /* ============================================================
     HERO PARALLAX + GENERIC [data-parallax]
  ============================================================ */
  (function parallax() {
    if (reduceMotion) return;
    const hero = $('.hero-title');
    const parallaxItems = $$('[data-parallax]');
    let ticking = false;
    function run() {
      if (hero) {
        const y = Math.min(window.scrollY, 520);
        hero.style.transform = `translate3d(0,${y * 0.08}px,0) scale(${1 - y * 0.00008})`;
        hero.style.opacity = String(Math.max(0.28, 1 - y / 650));
      }
      parallaxItems.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.08;
        const rect = el.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
        el.style.transform = `translate3d(0,${-offset}px,0)`;
      });
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(run); ticking = true; }
    }, { passive: true });
    run();
  })();

  /* ============================================================
     MAGNETIC BUTTONS + 3D TILT CARDS (desktop only)
  ============================================================ */
  if (isFinePointer && !reduceMotion) {
    $$('.btn, .hero-cta, .player-btn').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.08}px,${y * 0.08}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });

    $$('.track-card, .expertise-card, .social-card, .music-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * 6;
        const ry = (px - 0.5) * 6;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ============================================================
     NUMERIC COUNTERS
  ============================================================ */
  (function counters() {
    $$('[data-counter]').forEach(el => {
      const target = parseFloat(el.getAttribute('data-counter'));
      if (!isFinite(target)) return;
      const obs = new IntersectionObserver((entries, o) => {
        if (!entries[0].isIntersecting) return;
        const start = performance.now();
        const duration = 1100;
        (function tick(now) {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(tick);
        })(start);
        o.disconnect();
      }, { threshold: 0.8 });
      obs.observe(el);
    });
  })();

  /* ============================================================
     EASTER EGG
  ============================================================ */
  (function easterEgg() {
    const trigger = $('#easterEggTrigger');
    const egg = $('#easterEgg');
    let timer;
    trigger?.addEventListener('click', () => {
      egg?.classList.add('show');
      clearTimeout(timer);
      timer = setTimeout(() => egg?.classList.remove('show'), 3000);
    });
  })();

  /* ==========================================================================
     🎧 PLAYER MODULE — single source of truth for playback.
     Renders the Music section + popup playlist from TRACKS, drives the
     popup ("full") player and the always-available dock ("mini") player,
     both bound to the same <audio> element so playback survives closing
     the popup. Also reports to the OS media session (lock screen / media
     keys / Bluetooth) so it behaves like a real streaming app.
  ============================================================================ */
  const playableTracks = TRACKS
    .map((t, i) => ({ ...t, index: i }))
    .filter(t => !t.comingSoon && t.src);

  const audio = $('#audioPlayer');
  const popup = $('#platformPopup');
  const popupOverlay = $('#popupOverlay');
  const popupClose = $('#popupClose');
  const popupCoverImg = $('#popupCoverImg');

  const playBtn = $('#playerPlayBtn');
  const prevBtn = $('#playerPrevBtn');
  const nextBtn = $('#playerNextBtn');
  const shuffleBtn = $('#playerShuffleBtn');
  const repeatBtn = $('#playerRepeatBtn');
  const volumeInput = $('#playerVolume');
  const muteBtn = $('#playerMuteBtn');
  const progressBarEl = $('#playerProgress');
  const progressFillEl = $('#playerProgressFill');
  const currentTimeEl = $('#currentTime');
  const totalTimeEl = $('#totalTime');
  const visualizer = $('#visualizer');
  const trackTitleEl = $('#playerTrackTitle');
  const trackIndexEl = $('#playerTrackIndex');
  const playlistEl = $('#idenPlaylist');

  const musicFeaturedEl = $('#musicFeatured');
  const musicGridEl = $('#musicGrid');

  const dock = $('#idenDockPlayer');
  const dockPlayBtn = $('#dockPlayBtn');
  const dockCover = $('#dockCover');
  const dockTitle = $('#dockTitle');
  const dockArtist = $('#dockArtist');
  const dockProgress = $('#dockProgress');
  const dockProgressFill = $('#dockProgressFill');
  const dockNextBtn = $('#dockNextBtn');
  const dockPrevBtn = $('#dockPrevBtn');
  const dockCloseBtn = $('#dockCloseBtn');
  const dockExpandBtn = $('#dockExpandBtn');

  const notificationContainer = $('#notificationContainer');

  function dockVisible() { return !!dock?.classList.contains('active'); }

  function notify(message, tone) {
    if (!notificationContainer) { console.warn(message); return; }
    const el = document.createElement('div');
    el.className = 'iden-toast' + (tone === 'error' ? ' iden-toast-error' : '');
    el.textContent = message;
    notificationContainer.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 350);
    }, 3200);
  }

  // Guard: site still works fine with zero playable tracks (only "coming soon"
  // placeholders) — every control below no-ops safely instead of throwing.
  let current = 0;          // index within playableTracks
  let shuffle = false;
  let repeat = false;
  let hasLoadedOnce = false;
  let isSeeking = false;

  function hasTracks() { return playableTracks.length > 0; }
  function trackAt(i) {
    if (!hasTracks()) return null;
    return playableTracks[((i % playableTracks.length) + playableTracks.length) % playableTracks.length];
  }

  /* ---------- render Music section from TRACKS ---------- */
  function renderMusicSection() {
    if (!musicFeaturedEl && !musicGridEl) return;
    const [featured, ...rest] = TRACKS;

    if (musicFeaturedEl && featured && !featured.comingSoon) {
      musicFeaturedEl.innerHTML = `
        <div class="featured-track-cover" data-play-index="0" role="button" tabindex="0" aria-label="پخش ${featured.title}">
          <img src="${featured.cover}" alt="${featured.title}" class="track-cover-img" loading="lazy">
          <div class="track-overlay"><span class="track-play-icon">▶</span></div>
        </div>
        <div class="featured-info">
          <span class="featured-badge">لذت ببر :)</span>
          <h3>${featured.title}</h3>
          <p>برای گوش دادن روی کاور کلیک کن</p>
        </div>`;
    }

    if (musicGridEl) {
      musicGridEl.innerHTML = rest.map((t, i) => {
        const num = String(i + 2).padStart(2, '0');
        if (t.comingSoon) {
          return `
          <div class="music-card coming-soon">
            <div class="music-card-cover coming-soon-cover"><span>SOON</span></div>
            <span class="music-card-num">${num}</span>
            <h4>${t.title}</h4>
            <span class="music-card-tag">COMING SOON</span>
          </div>`;
        }
        return `
        <div class="music-card" data-play-index="${i + 1}" role="button" tabindex="0" aria-label="پخش ${t.title}">
          <div class="music-card-cover">
            <img src="${t.cover}" alt="${t.title}" loading="lazy">
            <div class="music-card-overlay">▶</div>
          </div>
          <span class="music-card-num">${num}</span>
          <h4>${t.title}</h4>
          <span class="music-card-tag">${t.artist || 'PLAY'}</span>
        </div>`;
      }).join('');
    }

    $$('[data-play-index]').forEach(el => {
      const activate = () => {
        const trackIdx = Number(el.getAttribute('data-play-index'));
        const playableIdx = playableTracks.findIndex(t => t.index === trackIdx);
        if (playableIdx === -1) return;
        openPopup(playableIdx);
      };
      el.addEventListener('click', activate);
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
    });
  }

  /* ---------- render playlist inside popup ---------- */
  function renderPlaylist() {
    if (!playlistEl) return;
    const head = playlistEl.querySelector('.iplayer-playlist-head');
    playlistEl.innerHTML = '';
    if (head) playlistEl.appendChild(head);
    else playlistEl.insertAdjacentHTML('beforeend', '<div class="iplayer-playlist-head"><span>پلی‌لیست</span><span>SONIC UNIVERSE</span></div>');

    TRACKS.forEach((t, i) => {
      const playableIdx = playableTracks.findIndex(pt => pt.index === i);
      if (t.comingSoon || playableIdx === -1) {
        playlistEl.insertAdjacentHTML('beforeend', `
          <div class="iplayer-playlist-item disabled">
            <span class="iplayer-num">${String(i + 1).padStart(2, '0')}</span>
            <span class="iplayer-name">${t.title}</span>
            <span class="iplayer-status">SOON</span>
          </div>`);
      } else {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'iplayer-playlist-item' + (playableIdx === current ? ' active' : '');
        btn.dataset.playableIndex = String(playableIdx);
        btn.innerHTML = `
          <span class="iplayer-num">${String(i + 1).padStart(2, '0')}</span>
          <span class="iplayer-name">${t.title}</span>
          <span class="iplayer-status">PLAY</span>`;
        btn.addEventListener('click', () => loadTrack(playableIdx, true));
        playlistEl.appendChild(btn);
      }
    });
  }

  function highlightActivePlaylistItem() {
    $$('.iplayer-playlist-item[data-playable-index]').forEach(el => {
      el.classList.toggle('active', Number(el.dataset.playableIndex) === current);
    });
  }

  /* ---------- media session (lock screen / hardware media keys) ---------- */
  function updateMediaSession(t) {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t.title,
        artist: t.artist || 'IDEN',
        album: 'IDEN · SONIC UNIVERSE',
        artwork: t.cover ? [{ src: t.cover, sizes: '512x512', type: 'image/png' }] : []
      });
      navigator.mediaSession.setActionHandler('play', play);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('previoustrack', goPrev);
      navigator.mediaSession.setActionHandler('nexttrack', goNext);
      navigator.mediaSession.setActionHandler('seekto', d => {
        if (audio && d.seekTime != null) audio.currentTime = d.seekTime;
      });
    } catch (_) { /* older browsers — safe to ignore */ }
  }

  /* ---------- core playback ---------- */
  function loadTrack(i, autoplay) {
    if (!audio || !hasTracks()) return;
    current = ((i % playableTracks.length) + playableTracks.length) % playableTracks.length;
    const t = trackAt(current);
    if (!t) return;
    hasLoadedOnce = true;

    audio.pause();
    audio.removeAttribute('src');
    audio.currentTime = 0;
    audio.src = t.src;
    audio.load();

    if (trackTitleEl) trackTitleEl.textContent = t.title;
    if (trackIndexEl) trackIndexEl.textContent = `${String(current + 1).padStart(2, '0')} / ${String(playableTracks.length).padStart(2, '0')}`;
    if (popupCoverImg && t.cover) { popupCoverImg.src = t.cover; popupCoverImg.alt = t.title; }
    if (dockCover && t.cover) { dockCover.src = t.cover; dockCover.alt = t.title; }
    if (dockTitle) dockTitle.textContent = t.title;
    if (dockArtist) dockArtist.textContent = t.artist || 'IDEN';

    if (progressFillEl) progressFillEl.style.width = '0%';
    if (currentTimeEl) currentTimeEl.textContent = '0:00';
    if (totalTimeEl) totalTimeEl.textContent = '0:00';
    if (dockProgressFill) dockProgressFill.style.width = '0%';

    highlightActivePlaylistItem();
    updateMediaSession(t);

    if (autoplay) play();
  }

  function play() {
    if (!audio) return;
    if (!hasTracks()) { notify('هنوز آهنگی برای پخش منتشر نشده — به‌زودی 🎵'); return; }
    if (!audio.src) { loadTrack(current, true); return; }
    const p = audio.play();
    if (p?.catch) {
      p.catch(() => {
        // Autoplay was blocked by the browser — this is expected on first
        // load in some browsers; the UI just stays paused, no crash, no spam.
        syncPlayingUI();
      });
    }
  }

  function pause() { audio?.pause(); }
  function togglePlay() { if (!audio) return; audio.paused ? play() : pause(); }

  function goNext() {
    if (!hasTracks()) return;
    let next;
    if (shuffle && playableTracks.length > 1) {
      do { next = Math.floor(Math.random() * playableTracks.length); } while (next === current);
    } else {
      next = current + 1;
    }
    loadTrack(next, true);
  }
  function goPrev() {
    if (!hasTracks()) return;
    if (audio && audio.currentTime > 3) { audio.currentTime = 0; return; }
    loadTrack(current - 1, true);
  }

  function syncPlayingUI() {
    const playing = !!audio && !audio.paused && !audio.ended;
    playBtn?.classList.toggle('playing', playing);
    dockPlayBtn?.classList.toggle('playing', playing);
    visualizer?.classList.toggle('active', playing);
    playBtn?.setAttribute('aria-label', playing ? 'توقف' : 'پخش');
    dockPlayBtn?.setAttribute('aria-label', playing ? 'توقف' : 'پخش');
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    if (playing) showDock();
  }

  function showDock() { dock?.classList.add('active'); }
  function hideDock() { dock?.classList.remove('active'); }

  /* ---------- popup open/close (popup close does NOT stop playback) ---------- */
  function openPopup(playableIdx) {
    if (!popup) return;
    if (!hasTracks()) { notify('هنوز آهنگی برای پخش منتشر نشده — به‌زودی 🎵'); return; }
    if (playableIdx !== current || !hasLoadedOnce) loadTrack(playableIdx, true);
    popup.style.display = 'flex';
    body.style.overflow = 'hidden';
    popupClose?.focus();
  }
  function closePopup() {
    if (!popup) return;
    popup.style.display = 'none';
    body.style.overflow = menuOpen ? 'hidden' : '';
    // playback keeps going — it just hands off to the dock player.
  }

  /* ---------- wire audio element events once ---------- */
  audio?.addEventListener('timeupdate', () => {
    if (isSeeking) return; // don't fight the user's finger while dragging
    const duration = audio.duration || 0;
    const pct = duration ? (audio.currentTime / duration) * 100 : 0;
    if (progressFillEl) progressFillEl.style.width = pct + '%';
    if (dockProgressFill) dockProgressFill.style.width = pct + '%';
    if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
    if (totalTimeEl) totalTimeEl.textContent = formatTime(duration);
  });
  audio?.addEventListener('loadedmetadata', () => {
    if (totalTimeEl) totalTimeEl.textContent = formatTime(audio.duration);
    if ('mediaSession' in navigator && audio.duration) {
      try { navigator.mediaSession.setPositionState({ duration: audio.duration, playbackRate: 1, position: 0 }); } catch (_) {}
    }
  });
  audio?.addEventListener('play', syncPlayingUI);
  audio?.addEventListener('pause', syncPlayingUI);
  audio?.addEventListener('ended', () => {
    if (repeat) { loadTrack(current, true); return; }
    if (playableTracks.length > 1) { goNext(); return; }
    audio.currentTime = 0;
    syncPlayingUI();
  });
  audio?.addEventListener('error', () => {
    notify('فایل صوتی این آهنگ بارگذاری نشد. لینک src را در script.js بررسی کن.', 'error');
    syncPlayingUI();
  });

  /* ---------- controls ---------- */
  playBtn?.addEventListener('click', togglePlay);
  dockPlayBtn?.addEventListener('click', togglePlay);
  nextBtn?.addEventListener('click', goNext);
  dockNextBtn?.addEventListener('click', goNext);
  prevBtn?.addEventListener('click', goPrev);
  dockPrevBtn?.addEventListener('click', goPrev);

  shuffleBtn?.addEventListener('click', function () {
    shuffle = !shuffle;
    this.classList.toggle('active', shuffle);
    this.setAttribute('aria-pressed', String(shuffle));
  });
  repeatBtn?.addEventListener('click', function () {
    repeat = !repeat;
    this.classList.toggle('active', repeat);
    this.setAttribute('aria-pressed', String(repeat));
  });

  /* ---------- seeking: click AND smooth drag, on both progress bars ---------- */
  function ratioFromEvent(el, e) {
    const rect = el.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    return Math.max(0, Math.min(1, x / rect.width));
  }
  function bindSeek(el, fillEl) {
    if (!el) return;
    let dragging = false;
    const setFromRatio = ratio => {
      if (fillEl) fillEl.style.width = (ratio * 100) + '%';
      if (currentTimeEl && audio?.duration) currentTimeEl.textContent = formatTime(ratio * audio.duration);
    };
    const start = e => {
      if (!audio?.duration) return;
      dragging = true; isSeeking = true;
      el.classList.add('is-seeking');
      setFromRatio(ratioFromEvent(el, e));
    };
    const move = e => {
      if (!dragging) return;
      setFromRatio(ratioFromEvent(el, e));
    };
    const end = e => {
      if (!dragging) return;
      dragging = false; isSeeking = false;
      el.classList.remove('is-seeking');
      if (audio?.duration) audio.currentTime = ratioFromEvent(el, e) * audio.duration;
    };
    el.addEventListener('pointerdown', start);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', end);
    el.addEventListener('click', e => { if (audio?.duration && !dragging) audio.currentTime = ratioFromEvent(el, e) * audio.duration; });
  }
  bindSeek(progressBarEl, progressFillEl);
  bindSeek(dockProgress, dockProgressFill);

  if (volumeInput && audio) {
    audio.volume = 1;
    volumeInput.style.setProperty('--vol-pct', '100%');
    volumeInput.addEventListener('input', function () {
      const v = Number(this.value);
      audio.volume = v;
      audio.muted = v === 0;
      this.style.setProperty('--vol-pct', (v * 100) + '%');
      muteBtn?.classList.toggle('muted', audio.muted);
    });
  }
  muteBtn?.addEventListener('click', () => {
    if (!audio) return;
    audio.muted = !audio.muted;
    muteBtn.classList.toggle('muted', audio.muted);
    if (!audio.muted && audio.volume === 0 && volumeInput) {
      audio.volume = 1;
      volumeInput.value = '1';
      volumeInput.style.setProperty('--vol-pct', '100%');
    }
    muteBtn.setAttribute('aria-label', audio.muted ? 'فعال کردن صدا' : 'بی‌صدا کردن');
  });

  popupOverlay?.addEventListener('click', closePopup);
  popupClose?.addEventListener('click', closePopup);
  dockCloseBtn?.addEventListener('click', () => { pause(); hideDock(); });
  dockExpandBtn?.addEventListener('click', () => openPopup(current));

  document.addEventListener('keydown', e => {
    const popupOpen = popup?.style.display === 'flex';
    const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
    if ((popupOpen || dockVisible()) && !typing) {
      if (e.key === 'Escape' && popupOpen) closePopup();
      if (e.key === ' ' && document.activeElement?.tagName !== 'BUTTON') { e.preventDefault(); togglePlay(); }
      if (e.key.toLowerCase() === 'm') muteBtn?.click();
      if (popupOpen && audio?.duration) {
        if (e.key === 'ArrowRight') { e.preventDefault(); audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); audio.currentTime = Math.max(0, audio.currentTime - 5); }
      }
    }
  });

  /* ==========================================================
     🔒 ACCESS DETERRENT — best-effort, client-side only.
     Honest note: this CANNOT be real security. Anyone can still
     view-source, disable JavaScript, use curl, or read the
     network tab before this code even runs — client-side JS can
     never truly stop inspection. This only makes casual right‑
     click / F12 a little less convenient and shows a clear
     "دسترسی تعریف نشده" message, nothing more.
  ============================================================ */
  (function accessDeterrent() {
    const overlay = $('#accessBlockedOverlay');
    let overlayOn = false;

    function showOverlay() {
      if (overlayOn) return;
      overlayOn = true;
      overlay?.classList.add('show');
      pause();
    }
    function hideOverlay() {
      if (!overlayOn) return;
      overlayOn = false;
      overlay?.classList.remove('show');
    }

    document.addEventListener('contextmenu', e => {
      e.preventDefault();
      notify('دسترسی تعریف نشده', 'error');
    });

    document.addEventListener('keydown', e => {
      const k = e.key;
      const blocked =
        k === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(k)) ||
        (e.ctrlKey && ['U', 'u'].includes(k));
      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        notify('دسترسی تعریف نشده', 'error');
      }
    }, true);

    // Heuristic DevTools-open detector (compares outer/inner window size).
    // Threshold kept generous on purpose to avoid false positives from
    // normal browser zoom, narrow windows, or split-screen setups.
    const THRESHOLD = 160;
    setInterval(() => {
      const widthGap = window.outerWidth - window.innerWidth;
      const heightGap = window.outerHeight - window.innerHeight;
      if (widthGap > THRESHOLD || heightGap > THRESHOLD) showOverlay();
      else hideOverlay();
    }, 800);
  })();

  /* ---------- boot ---------- */
  renderMusicSection();
  renderPlaylist();
})();
