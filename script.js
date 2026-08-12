// ============================================
// IDEN — SONIC UNIVERSE
// Full JavaScript — Animations, Easter Eggs, Interactions
// ============================================

// ========== PRELOADER ==========
window.addEventListener('load', () => {
    setTimeout(() => {
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
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        this.pulseOffset = Math.random() * Math.PI * 2;
    }
    update(time) {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
        this.currentOpacity = this.opacity + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.12;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,164,92,${Math.max(0.02, this.currentOpacity)})`;
        ctx.fill();
    }
}

for (let i = 0; i < 50; i++) particles.push(new Particle());

function animateParticles(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(timestamp); p.draw(); });
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(200,164,92,${0.035*(1-dist/100)})`;
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateParticles);
}
requestAnimationFrame(animateParticles);

// ========== DISABLE RIGHT CLICK & F12 ==========
document.addEventListener('contextmenu', e => {
    e.preventDefault();
    showNotification();
});
document.addEventListener('keydown', e => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) || (e.ctrlKey && e.key === 'U')) {
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
    setTimeout(() => notif.remove(), 2500);
}

// ========== NAVBAR SCROLL ==========
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ========== MENU TOGGLE ==========
const menuBtn = document.getElementById('menuBtn');
const navOverlay = document.getElementById('navOverlay');
let menuOpen = false;

menuBtn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    menuBtn.classList.toggle('active', menuOpen);
    navOverlay.classList.toggle('active', menuOpen);
    menuBtn.setAttribute('aria-expanded', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        menuOpen = false;
        menuBtn.classList.remove('active');
        navOverlay.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    });
});

// ========== SCROLL REVEAL ==========
const revealElements = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });

revealElements.forEach(el => observer.observe(el));

// ========== TYPEWRITER ==========
const typewriterTexts = [
    'آهنگساز، پرودیوسر و هنرمند مستقل',
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
typeWriter();

// ========== VINYL PLAY/PAUSE ==========
const vinylRecord = document.getElementById('vinylRecord');
if (vinylRecord) {
    vinylRecord.addEventListener('click', function() {
        this.classList.toggle('paused');
    });
}

// ========== AUDIO TOGGLE ==========
const toggleAudioBtn = document.getElementById('toggleAudio');
if (toggleAudioBtn) {
    toggleAudioBtn.addEventListener('click', function() {
        const icon = this.querySelector('span');
        if (icon.textContent === '▶') {
            icon.textContent = '⏸';
            this.style.borderColor = 'var(--red)';
        } else {
            icon.textContent = '▶';
            this.style.borderColor = 'rgba(255,255,255,0.2)';
        }
    });
}

// ========== EASTER EGGS ==========

// 1. Konami Code
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIdx = 0;
document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === konamiCode[konamiIdx].toLowerCase()) {
        konamiIdx++;
        if (konamiIdx === konamiCode.length) {
            konamiIdx = 0;
            triggerEasterEgg('🎮 Konami Code Activated!');
        }
    } else {
        konamiIdx = 0;
    }
});

// 2. Type "iden"
let typed = '';
document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    typed += e.key.toLowerCase();
    if (typed.length > 4) typed = typed.slice(-4);
    if (typed === 'iden') {
        typed = '';
        triggerEasterEgg('⌨️ You typed IDEN!');
    }
});

// 3. Double-click on profile image
const heroImage = document.querySelector('.hero-image');
if (heroImage) {
    heroImage.addEventListener('dblclick', e => {
        e.preventDefault();
        triggerEasterEgg('🖼️ Double-click on profile!');
    });
}

// 4. Easter egg trigger button
const easterEggTrigger = document.getElementById('easterEggTrigger');
if (easterEggTrigger) {
    easterEggTrigger.addEventListener('click', () => {
        triggerEasterEgg('🔍 Hidden trigger found!');
    });
}

function triggerEasterEgg(msg) {
    const easterEgg = document.getElementById('easterEgg');
    easterEgg.querySelector('span').textContent = msg;
    easterEgg.classList.add('show');
    spawnConfetti();
    setTimeout(() => easterEgg.classList.remove('show'), 3000);
}

function spawnConfetti() {
    const colors = ['#c41e3a', '#c8a45c', '#fff', '#e0c878', '#8b0000', '#ffd700'];
    for (let i = 0; i < 60; i++) {
        const el = document.createElement('div');
        el.style.cssText = `
            position: fixed;
            top: -20px;
            left: ${Math.random() * window.innerWidth}px;
            width: ${Math.random() * 10 + 4}px;
            height: ${Math.random() * 10 + 4}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            z-index: 999999;
            pointer-events: none;
            border-radius: ${Math.random() > 0.5 ? '50%' : '1px'};
            animation: confettiFall ${Math.random() * 2 + 2}s ease-out forwards;
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3000);
    }
}

// Add confetti animation
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
        100% { transform: translateY(105vh) rotate(720deg) scale(0); opacity: 0; }
    }
`;
document.head.appendChild(confettiStyle);

// ========== PARALLAX EFFECT ==========
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const orb = document.querySelector('.hero-bg-orb');
    if (orb) {
        orb.style.transform = `translate(-50%, -50%) translateY(${scrolled * 0.03}px)`;
    }
});

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ========== CONSOLE EASTER EGG ==========
console.log(`
╔══════════════════════════════════════╗
║                                      ║
║   ██╗██████╗ ███████╗███╗   ██╗     ║
║   ██║██╔══██╗██╔════╝████╗  ██║     ║
║   ██║██║  ██║█████╗  ██╔██╗ ██║     ║
║   ██║██║  ██║██╔══╝  ██║╚██╗██║     ║
║   ██║██████╔╝███████╗██║ ╚████║     ║
║   ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═══╝     ║
║                                      ║
║   IDEN You Are Crazy                 ║
║   Welcome to the hidden world.       ║
║   contact@idenmusic.com              ║
║                                      ║
╚══════════════════════════════════════╝
`);

console.log('%c🎵 %cIDEN %c— %cSonic Universe',
    'font-size:1.2em;',
    'font-size:1.5em;font-weight:bold;color:#c41e3a;',
    '',
    'font-style:italic;color:#c8a45c;');
// ========== PLATFORM POPUP + LUXURY PLAYER ==========
document.addEventListener('DOMContentLoaded', function() {
    const platformPopup = document.getElementById('platformPopup');
    const popupOverlay = document.getElementById('popupOverlay');
    const popupClose = document.getElementById('popupClose');
    const popupTrackName = document.getElementById('popupTrackName');
    const audioPlayer = document.getElementById('audioPlayer');
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
            openPopup(trackName);
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
            isPlaying = false;
            if (playBtn) {
                playBtn.classList.remove('playing');
                if (playIcon) playIcon.textContent = '▶';
            }
            if (visualizer) visualizer.classList.remove('active');
            if (progressFill) progressFill.style.width = '0%';
            if (currentTimeEl) currentTimeEl.textContent = '0:00';
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
});// ========== DOWNLOAD SECRET ==========
document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('downloadBtn');
    const downloadSecret = document.getElementById('downloadSecret');
    let secretVisible = false;

    if (downloadBtn && downloadSecret) {
        downloadBtn.addEventListener('click', function() {
            if (!secretVisible) {
                downloadSecret.classList.add('show');
                secretVisible = true;
            }
        });

        downloadSecret.addEventListener('click', function() {
            // لینک دانلود
            window.open('https://files.catbox.moe/wcpaia.mp3', '_blank');
            // یا دانلود مستقیم
            // window.location.href = 'https://files.catbox.moe/wcpaia.mp3';
        });
    }
});