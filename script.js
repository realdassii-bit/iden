// ============================================
// IDEN — SONIC UNIVERSE
// Complete JavaScript
// ============================================

// ========== PRELOADER ==========
window.addEventListener('load', function() {
    setTimeout(function() {
        document.getElementById('preloader').classList.add('hidden');
    }, 2500);
});

// ========== PARTICLES ==========
const canvas = document.getElementById('particlesCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.8 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.35 + 0.08;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,164,92,' + this.opacity + ')';
        ctx.fill();
    }
}

for (let i = 0; i < 50; i++) particles.push(new Particle());

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function(p) {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ========== DISABLE RIGHT CLICK & F12 ==========
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    showNotification();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'F12') {
        e.preventDefault();
        showNotification();
    }
});

function showNotification() {
    const container = document.getElementById('notificationContainer');
    const notif = document.createElement('div');
    notif.className = 'glass-notification';
    notif.textContent = '🚫 Right Click & Dev Tools Disabled';
    container.appendChild(notif);
    setTimeout(function() {
        notif.remove();
    }, 2500);
}

// ========== NAVBAR ==========
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ========== MENU ==========
const menuBtn = document.getElementById('menuBtn');
const navOverlay = document.getElementById('navOverlay');
let menuOpen = false;

if (menuBtn) {
    menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        menuOpen = !menuOpen;
        menuBtn.classList.toggle('active', menuOpen);
        navOverlay.classList.toggle('active', menuOpen);
        document.body.style.overflow = menuOpen ? 'hidden' : '';
    });
}

document.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function() {
        menuOpen = false;
        menuBtn.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ========== SCROLL REVEAL ==========
const revealElements = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.15 });

revealElements.forEach(function(el) {
    observer.observe(el);
});

// ========== TYPEWRITER ==========
const typewriterTexts = [
    'آهنگساز، پرودیوسر و هنرمند مستقل',
    'آوا هایی توسط من تولید میشن با تمام آوا ها متفاوته ',
    'IDEN You Are Crazy'
];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typewriterEl = document.getElementById('typewriter');

function typeWriter() {
    const currentText = typewriterTexts[textIndex];
    if (isDeleting) {
        typewriterEl.innerHTML = currentText.substring(0, charIndex - 1) + '<span class="cursor"></span>';
        charIndex--;
    } else {
        typewriterEl.innerHTML = currentText.substring(0, charIndex + 1) + '<span class="cursor"></span>';
        charIndex++;
    }
    let speed = isDeleting ? 40 : 70;
    if (!isDeleting && charIndex === currentText.length) {
        speed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % typewriterTexts.length;
        speed = 400;
    }
    setTimeout(typeWriter, speed);
}
if (typewriterEl) typeWriter();

// ========== VINYL ==========
const vinylRecord = document.getElementById('vinylRecord');
if (vinylRecord) {
    vinylRecord.addEventListener('click', function() {
        this.classList.toggle('paused');
    });
}

// ========== PLATFORM POPUP ==========
const platformPopup = document.getElementById('platformPopup');
const popupOverlay = document.getElementById('popupOverlay');
const popupClose = document.getElementById('popupClose');
const popupTrackName = document.getElementById('popupTrackName');
const audioPlayer = document.getElementById('audioPlayer');

function openPopup(trackName) {
    if (popupTrackName) popupTrackName.textContent = trackName;
    if (platformPopup) {
        platformPopup.classList.add('active');
        platformPopup.style.display = 'block';
    }
    document.body.style.overflow = 'hidden';
}

function closePopup() {
    if (platformPopup) {
        platformPopup.classList.remove('active');
        platformPopup.style.display = 'none';
    }
    document.body.style.overflow = '';
    stopAudio();
}

// ترک اصلی
const trackCover1 = document.getElementById('trackCover1');
if (trackCover1) {
    trackCover1.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openPopup('Fuck The Police');
    });
}

// ترک‌های گرید
document.querySelectorAll('.track-card').forEach(function(card) {
    card.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const trackName = card.getAttribute('data-track');
        openPopup(trackName || 'Track');
    });
});

// بستن
if (popupOverlay) {
    popupOverlay.addEventListener('click', function(e) {
        e.preventDefault();
        closePopup();
    });
}

if (popupClose) {
    popupClose.addEventListener('click', function(e) {
        e.preventDefault();
        closePopup();
    });
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closePopup();
});

// ========== LUXURY PLAYER ==========
const playBtn = document.getElementById('playerPlayBtn');
const playIcon = document.getElementById('playIcon');
const progressFill = document.getElementById('playerProgressFill');
const progress = document.getElementById('playerProgress');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const muteBtn = document.getElementById('playerMuteBtn');
const muteIcon = document.getElementById('muteIcon');
const visualizer = document.getElementById('visualizer');

let isPlaying = false;
let isMuted = false;

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

function stopAudio() {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        isPlaying = false;
        if (playBtn) {
            playBtn.classList.remove('playing');
            if (playIcon) playIcon.textContent = '▶';
        }
        if (visualizer) visualizer.classList.remove('active');
        if (progressFill) progressFill.style.width = '0%';
        if (currentTimeEl) currentTimeEl.textContent = '0:00';
    }
}

if (playBtn) {
    playBtn.addEventListener('click', function() {
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
    });
}

if (audioPlayer) {
    audioPlayer.addEventListener('timeupdate', function() {
        const current = audioPlayer.currentTime;
        const duration = audioPlayer.duration;
        if (duration) {
            const percent = (current / duration) * 100;
            if (progressFill) progressFill.style.width = percent + '%';
            if (currentTimeEl) currentTimeEl.textContent = formatTime(current);
            if (totalTimeEl) totalTimeEl.textContent = formatTime(duration);
        }
    });

    audioPlayer.addEventListener('loadedmetadata', function() {
        if (totalTimeEl) totalTimeEl.textContent = formatTime(audioPlayer.duration);
    });

    audioPlayer.addEventListener('ended', function() {
        stopAudio();
    });
}

if (progress) {
    progress.addEventListener('click', function(e) {
        const rect = progress.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (audioPlayer.duration) {
            audioPlayer.currentTime = percent * audioPlayer.duration;
        }
    });
}

if (muteBtn) {
    muteBtn.addEventListener('click', function() {
        if (isMuted) {
            audioPlayer.muted = false;
            muteIcon.textContent = '🔊';
            isMuted = false;
        } else {
            audioPlayer.muted = true;
            muteIcon.textContent = '🔇';
            isMuted = true;
        }
    });
}

// ========== DOWNLOAD SECRET ==========
const downloadBtn = document.getElementById('downloadBtn');
const downloadSecret = document.getElementById('downloadSecret');
let secretVisible = false;

if (downloadBtn && downloadSecret) {
    downloadBtn.addEventListener('click', function() {
        if (!secretVisible) {
            downloadSecret.classList.add('show');
            downloadSecret.style.display = 'block';
            secretVisible = true;
        }
    });

    downloadSecret.addEventListener('click', function() {
        window.open('https://files.catbox.moe/wcpaia.mp3', '_blank');
    });
}

// ========== EASTER EGGS ==========
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIdx = 0;

document.addEventListener('keydown', function(e) {
    if (e.key.toLowerCase() === konamiCode[konamiIdx].toLowerCase()) {
        konamiIdx++;
        if (konamiIdx === konamiCode.length) {
            konamiIdx = 0;
            triggerEasterEgg('🎮 Konami Code!');
        }
    } else {
        konamiIdx = 0;
    }
});

let typed = '';
document.addEventListener('keydown', function(e) {
    typed += e.key.toLowerCase();
    if (typed.length > 4) typed = typed.slice(-4);
    if (typed === 'iden') {
        typed = '';
        triggerEasterEgg('⌨️ IDEN!');
    }
});

function triggerEasterEgg(msg) {
    const easterEgg = document.getElementById('easterEgg');
    if (easterEgg) {
        easterEgg.querySelector('span').textContent = msg;
        easterEgg.classList.add('show');
        setTimeout(function() {
            easterEgg.classList.remove('show');
        }, 3000);
    }
}

// ========== CONSOLE ==========
console.log('IDEN You Are Crazy — Sonic Universe Loaded!');
