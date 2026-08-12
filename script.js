// ============================================
// IDEN — SONIC UNIVERSE
// Complete JavaScript — Final
// ============================================

// ========== PRELOADER ==========
window.addEventListener('load', function() {
    setTimeout(function() {
        var preloader = document.getElementById('preloader');
        if (preloader) preloader.classList.add('hidden');
    }, 2500);
});

// ========== PARTICLES ==========
var canvas = document.getElementById('particlesCanvas');
var ctx = canvas.getContext('2d');
var particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function Particle() {
    this.reset = function() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.8 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.35 + 0.08;
    };
    this.reset();
}

Particle.prototype.update = function() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
};

Particle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200,164,92,' + this.opacity + ')';
    ctx.fill();
};

for (var i = 0; i < 50; i++) particles.push(new Particle());

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function(p) { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ========== RIGHT CLICK ==========
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

// ========== NAVBAR ==========
var navbar = document.getElementById('navbar');
window.addEventListener('scroll', function() {
    if (navbar) {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    }
});

// ========== MENU ==========
var menuBtn = document.getElementById('menuBtn');
var navOverlay = document.getElementById('navOverlay');
var menuOpen = false;

if (menuBtn && navOverlay) {
    menuBtn.onclick = function(e) {
        e.stopPropagation();
        menuOpen = !menuOpen;
        menuBtn.classList.toggle('active', menuOpen);
        navOverlay.classList.toggle('active', menuOpen);
        document.body.style.overflow = menuOpen ? 'hidden' : '';
    };
}

document.querySelectorAll('.nav-link').forEach(function(link) {
    link.onclick = function() {
        menuOpen = false;
        if (menuBtn) menuBtn.classList.remove('active');
        if (navOverlay) navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };
});

// ========== TYPEWRITER ==========
var texts = ['آهنگساز، پرودیوسر و هنرمند مستقل', 'با وجود من آوا های متفاوتی میشنوی', 'IDEN You Are Crazy'];
var ti = 0, ci = 0, del = false;
var twEl = document.getElementById('typewriter');

function typeWriter() {
    if (!twEl) return;
    var current = texts[ti];
    if (del) {
        twEl.innerHTML = current.substring(0, ci - 1) + '<span class="cursor"></span>';
        ci--;
    } else {
        twEl.innerHTML = current.substring(0, ci + 1) + '<span class="cursor"></span>';
        ci++;
    }
    var speed = del ? 40 : 70;
    if (!del && ci === current.length) { speed = 2000; del = true; }
    else if (del && ci === 0) { del = false; ti = (ti + 1) % texts.length; speed = 400; }
    setTimeout(typeWriter, speed);
}
typeWriter();

// ========== POPUP ==========
var platformPopup = document.getElementById('platformPopup');
var popupOverlay = document.getElementById('popupOverlay');
var popupClose = document.getElementById('popupClose');
var popupTrackName = document.getElementById('popupTrackName');
var audioPlayer = document.getElementById('audioPlayer');
var miniCoverImg = document.querySelector('.player-mini-cover img');

function openPopup(trackName, coverSrc, audioSrc) {
    if (popupTrackName) popupTrackName.textContent = trackName;
    if (miniCoverImg && coverSrc) miniCoverImg.src = coverSrc;
    if (audioPlayer && audioSrc) { audioPlayer.src = audioSrc; audioPlayer.load(); }
    if (platformPopup) {
        platformPopup.style.display = 'flex';
        platformPopup.style.alignItems = 'center';
        platformPopup.style.justifyContent = 'center';
    }
    document.body.style.overflow = 'hidden';
}

function closePopup() {
    if (platformPopup) platformPopup.style.display = 'none';
    document.body.style.overflow = '';
    if (audioPlayer) { audioPlayer.pause(); audioPlayer.currentTime = 0; }
    if (playBtn) playBtn.classList.remove('playing');
    if (playIcon) playIcon.textContent = '▶';
    if (visualizer) visualizer.classList.remove('active');
}

var trackCover1 = document.getElementById('trackCover1');
if (trackCover1) {
    trackCover1.onclick = function() {
        openPopup('Fuck The Police', 'https://i.ibb.co/mCrXy88Q/Cover.png', 'https://files.catbox.moe/wcpaia.mp3');
    };
}

document.querySelectorAll('.track-card').forEach(function(card) {
    card.onclick = function() {
        var trackName = card.getAttribute('data-track') || 'Track';
        var coverSrc = card.getAttribute('data-cover') || '';
        var audioSrc = card.getAttribute('data-audio') || '';
        openPopup(trackName, coverSrc, audioSrc);
    };
});

if (popupOverlay) popupOverlay.onclick = closePopup;
if (popupClose) popupClose.onclick = closePopup;

// ========== PLAYER ==========
var playBtn = document.getElementById('playerPlayBtn');
var playIcon = document.getElementById('playIcon');
var progressFill = document.getElementById('playerProgressFill');
var progress = document.getElementById('playerProgress');
var currentTimeEl = document.getElementById('currentTime');
var totalTimeEl = document.getElementById('totalTime');
var muteBtn = document.getElementById('playerMuteBtn');
var muteIcon = document.getElementById('muteIcon');
var visualizer = document.getElementById('visualizer');
var isPlaying = false;
var isMuted = false;

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

if (playBtn && audioPlayer) {
    playBtn.onclick = function() {
        if (isPlaying) {
            audioPlayer.pause();
            playBtn.classList.remove('playing');
            playIcon.textContent = '▶';
            visualizer.classList.remove('active');
            isPlaying = false;
        } else {
            audioPlayer.play();
            playBtn.classList.add('playing');
            playIcon.textContent = '⏸';
            visualizer.classList.add('active');
            isPlaying = true;
        }
    };
}

if (audioPlayer) {
    audioPlayer.ontimeupdate = function() {
        if (audioPlayer.duration) {
            var p = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            if (progressFill) progressFill.style.width = p + '%';
            if (currentTimeEl) currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
            if (totalTimeEl) totalTimeEl.textContent = formatTime(audioPlayer.duration);
        }
    };
    audioPlayer.onloadedmetadata = function() {
        if (totalTimeEl) totalTimeEl.textContent = formatTime(audioPlayer.duration);
    };
    audioPlayer.onended = function() {
        isPlaying = false;
        playBtn.classList.remove('playing');
        playIcon.textContent = '▶';
        visualizer.classList.remove('active');
    };
}

if (progress && audioPlayer) {
    progress.onclick = function(e) {
        var rect = progress.getBoundingClientRect();
        var percent = (e.clientX - rect.left) / rect.width;
        if (audioPlayer.duration) audioPlayer.currentTime = percent * audioPlayer.duration;
    };
}

if (muteBtn && audioPlayer) {
    muteBtn.onclick = function() {
        if (isMuted) {
            audioPlayer.muted = false;
            muteIcon.textContent = '🔊';
            isMuted = false;
        } else {
            audioPlayer.muted = true;
            muteIcon.textContent = '🔇';
            isMuted = true;
        }
    };
}

// ========== EASTER EGG ==========
var easterEggTrigger = document.getElementById('easterEggTrigger');
var easterEgg = document.getElementById('easterEgg');

if (easterEggTrigger && easterEgg) {
    easterEggTrigger.onclick = function() {
        easterEgg.querySelector('span').textContent = 'IDEN You Are Crazy';
        easterEgg.classList.add('show');
        setTimeout(function() { easterEgg.classList.remove('show'); }, 3000);
    };
}

// ========== CONSOLE ==========
console.log('IDEN You Are Crazy — Sonic Universe Loaded!');