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
	