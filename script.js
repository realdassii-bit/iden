/**
 * =====================================================
 * IDEN — Sonic Universe
 * Main JavaScript — with Easter Eggs
 * =====================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    initSecurity();
    initPreloader();
    initParticles();
    initRevealAnimations();
    initMobileMenu();
    initSmoothScroll();
    initTypewriter();
    initAudioPlayer();
    initCounterAnimation();
    initAllEasterEggs();
    initSoundEffects();
    initSecretConsole();
});

/* =====================================================
   SECURITY
===================================================== */
function initSecurity() {
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showNotification('⛔', 'دسترسی محدود', 'کلیک راست غیرفعاله.');
    });

    document.addEventListener('keydown', (e) => {
        const blocked = [
            e.key === 'F12',
            (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase())),
            (e.ctrlKey && ['U','S'].includes(e.key.toUpperCase())),
        ];
        if (blocked.some(Boolean)) {
            e.preventDefault();
            showNotification('🔒', 'دسترسی محدود', 'ابزارهای توسعه‌دهنده غیرفعالن.');
        }
    });
}

/* =====================================================
   NOTIFICATION
===================================================== */
function showNotification(icon, title, message, duration = 4000) {
    const container = document.getElementById('notificationContainer');
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <div class="notification-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;
    container.appendChild(notif);
    
    setTimeout(() => {
        notif.classList.add('removing');
        setTimeout(() => notif.remove(), 300);
    }, duration);
    
    notif.addEventListener('click', () => {
        notif.classList.add('removing');
        setTimeout(() => notif.remove(), 300);
    });
}

/* =====================================================
   PRELOADER
===================================================== */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('progressBar');
    if (!preloader) return;
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        if (progressBar) progressBar.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => preloader.classList.add('hidden'), 500);
        }
    }, 200);
    
    setTimeout(() => {
        if (!preloader.classList.contains('hidden')) {
            preloader.classList.add('hidden');
        }
    }, 3000);
}

/* =====================================================
   PARTICLES
===================================================== */
function initParticles() {
    const canvas = document.getElementById('particlesCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    
    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.4 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
            ctx.fill();
        }
    }
    
    for (let i = 0; i < 70; i++) particles.push(new Particle());
    
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 130) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255,255,255,${0.03 * (1 - dist / 130)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        animId = requestAnimationFrame(animate);
    }
    
    animate();
    window.addEventListener('beforeunload', () => cancelAnimationFrame(animId));
}

/* =====================================================
   REVEAL ON SCROLL
===================================================== */
function initRevealAnimations() {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
    elements.forEach(el => observer.observe(el));
}

/* =====================================================
   MOBILE MENU
===================================================== */
function initMobileMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const navOverlay = document.getElementById('navOverlay');
    const navLinks = document.querySelectorAll('.nav-link');
    if (!menuBtn || !navOverlay) return;
    
    menuBtn.addEventListener('click', () => {
        const isActive = navOverlay.classList.toggle('active');
        menuBtn.classList.toggle('active');
        menuBtn.setAttribute('aria-expanded', isActive);
        document.body.classList.toggle('menu-open');
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navOverlay.classList.remove('active');
            menuBtn.classList.remove('active');
            menuBtn.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
        });
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navOverlay.classList.contains('active')) {
            navOverlay.classList.remove('active');
            menuBtn.classList.remove('active');
            menuBtn.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
        }
    });
}

/* =====================================================
   SMOOTH SCROLL
===================================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offset = 80;
                const pos = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: pos, behavior: 'smooth' });
            }
        });
    });
}

/* =====================================================
   TYPEWRITER
===================================================== */
function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    
    const phrases = [
        'آهنگساز . پرودیوسر . هنرمند مستقل',
        'ساختن صدا، فضا و هویت',
        'جایی که موسیقی احساس می‌شود',
        'IDEN You Are Crazy',
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    function type() {
        const current = phrases[phraseIndex];
        if (!isDeleting) {
            el.innerHTML = current.substring(0, charIndex + 1) + '<span class="cursor-blink"></span>';
            charIndex++;
            if (charIndex === current.length) {
                setTimeout(() => { isDeleting = true; type(); }, 2000);
                return;
            }
        } else {
            el.innerHTML = current.substring(0, charIndex - 1) + '<span class="cursor-blink"></span>';
            charIndex--;
            if (charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                setTimeout(type, 500);
                return;
            }
        }
        setTimeout(type, isDeleting ? 40 : 80);
    }
    
    type();
}

/* =====================================================
   AUDIO PLAYER
===================================================== */
function initAudioPlayer() {
    const audio = document.getElementById('bgAudio');
    const btn = document.getElementById('toggleAudio');
    if (!audio || !btn) return;
    audio.volume = 0.3;
    
    btn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().then(() => btn.classList.add('playing'))
                .catch(() => showNotification('🔇', 'صدا', 'برای پخش صدا با سایت تعامل کن.'));
        } else {
            audio.pause();
            btn.classList.remove('playing');
        }
    });
}

/* =====================================================
   COUNTER ANIMATION
===================================================== */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;
    
    const animate = (counter) => {
        const target = parseInt(counter.getAttribute('data-target'), 10);
        if (isNaN(target)) return;
        const duration = 2000;
        const start = performance.now();
        const update = (time) => {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            counter.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(update);
            else counter.textContent = target;
        };
        requestAnimationFrame(update);
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animate(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(c => observer.observe(c));
}

/* =====================================================
   🥚 ALL EASTER EGGS
===================================================== */
function initAllEasterEggs() {
    // Easter egg #1: نقطه مخفی پایین چپ (۵ کلیک)
    initDotEasterEgg();
    
    // Easter egg #2: تایپ "iden" با کیبورد
    initKeyboardEasterEgg();
    
    // Easter egg #3: کد کونامی (↑↑↓↓←→←→BA)
    initKonamiCode();
    
    // Easter egg #4: ۱۰ کلیک روی لوگو
    initLogoEasterEgg();
    
    // Easter egg #5: دابل کلیک روی عکس پروفایل
    initProfileEasterEgg();
    
    // Easter egg #6: نگه داشتن موس روی فوتتر ۵ ثانیه
    initFooterEasterEgg();
}

// 🥚 Easter Egg #1: نقطه مخفی — ۵ کلیک سریع
function initDotEasterEgg() {
    const trigger = document.getElementById('easterEggTrigger');
    const egg = document.getElementById('easterEgg');
    if (!trigger || !egg) return;
    
    let clickCount = 0;
    let resetTimer;
    
    trigger.addEventListener('click', () => {
        clickCount++;
        clearTimeout(resetTimer);
        
        if (clickCount >= 5) {
            activateEasterEgg(egg, 'IDEN You Are Crazy');
            clickCount = 0;
        }
        
        resetTimer = setTimeout(() => { clickCount = 0; }, 2000);
    });
}

// 🥚 Easter Egg #2: تایپ "iden" با کیبورد
function initKeyboardEasterEgg() {
    const egg = document.getElementById('easterEgg');
    if (!egg) return;
    
    let keyBuffer = '';
    
    document.addEventListener('keypress', (e) => {
        // Ignore if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        keyBuffer += e.key.toLowerCase();
        if (keyBuffer.length > 4) keyBuffer = keyBuffer.slice(-4);
        
        if (keyBuffer === 'iden') {
            activateEasterEgg(egg, '🖤 IDEN You Are Crazy 🖤');
            keyBuffer = '';
            showNotification('🥚', 'ایستر اگ پیدا شد!', 'تو راز رو کشف کردی...');
        }
        
        // Bonus: "danyal" or "danial"
        if (keyBuffer.length >= 6) {
            const last6 = keyBuffer.slice(-6);
            if (last6 === 'danyal' || last6 === 'danial') {
                activateEasterEgg(egg, '✨ Daniyal Sobeii ✨');
                keyBuffer = '';
                showNotification('💎', 'اسم واقعی!', 'دانیال سبیعی — IDEN');
            }
        }
        
        // Bonus: "music"
        if (keyBuffer === 'music' || keyBuffer.slice(-5) === 'music') {
            document.body.style.transition = 'all 0.5s ease';
            document.body.style.background = '#fff';
            document.body.style.color = '#000';
            setTimeout(() => {
                document.body.style.background = '';
                document.body.style.color = '';
            }, 500);
            showNotification('🎵', 'MUSIC!', 'برای یه لحظه همه چی روشن شد...');
        }
    });
}

// 🥚 Easter Egg #3: کد کونامی ↑↑↓↓←→←→ B A
function initKonamiCode() {
    const egg = document.getElementById('easterEgg');
    if (!egg) return;
    
    const konamiCode = [
        'ArrowUp', 'ArrowUp',
        'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight',
        'ArrowLeft', 'ArrowRight',
        'b', 'a'
    ];
    
    let konamiIndex = 0;
    
    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                // KONAMI ACTIVATED!
                activateEasterEgg(egg, '🔥 KONAMI CODE ACTIVATED 🔥');
                konamiIndex = 0;
                
                // Special effect: rainbow particles for 3 seconds
                const canvas = document.getElementById('particlesCanvas');
                if (canvas) {
                    canvas.style.filter = 'hue-rotate(0deg)';
                    let hue = 0;
                    const rainbowInterval = setInterval(() => {
                        hue = (hue + 10) % 360;
                        canvas.style.filter = `hue-rotate(${hue}deg)`;
                    }, 50);
                    
                    setTimeout(() => {
                        clearInterval(rainbowInterval);
                        canvas.style.filter = '';
                    }, 3000);
                }
                
                showNotification('🎮', 'کونامی!', 'کد مخفی فعال شد! 🌈');
            }
        } else {
            konamiIndex = 0;
        }
    });
}

// 🥚 Easter Egg #4: ۱۰ کلیک روی لوگو
function initLogoEasterEgg() {
    const logo = document.querySelector('.logo');
    const egg = document.getElementById('easterEgg');
    if (!logo || !egg) return;
    
    let logoClicks = 0;
    let logoReset;
    
    logo.addEventListener('click', (e) => {
        e.preventDefault();
        logoClicks++;
        clearTimeout(logoReset);
        
        if (logoClicks === 5) {
            showNotification('👀', 'کنجکاوی', 'داری نزدیک میشی...');
        }
        
        if (logoClicks >= 10) {
            activateEasterEgg(egg, '🌟 IDEN — World of Sound 🌟');
            logoClicks = 0;
            
            // Glitch the whole page briefly
            document.body.style.animation = 'none';
            document.body.offsetHeight;
            document.body.style.filter = 'invert(1)';
            setTimeout(() => { document.body.style.filter = ''; }, 200);
            setTimeout(() => { document.body.style.filter = 'invert(1)'; }, 400);
            setTimeout(() => { document.body.style.filter = ''; }, 600);
        }
        
        logoReset = setTimeout(() => { logoClicks = 0; }, 3000);
    });
}

// 🥚 Easter Egg #5: دابل کلیک روی عکس پروفایل
function initProfileEasterEgg() {
    const profileImg = document.querySelector('.hero-image');
    const egg = document.getElementById('easterEgg');
    if (!profileImg || !egg) return;
    
    profileImg.addEventListener('dblclick', () => {
        activateEasterEgg(egg, '📸 IDEN — Behind the Sound');
        
        // Rotate the portal rings faster briefly
        const rings = document.querySelectorAll('.portal-ring');
        rings.forEach(ring => {
            ring.style.animationDuration = '2s';
            setTimeout(() => { ring.style.animationDuration = ''; }, 2000);
        });
        
        showNotification('📸', 'عکس مخفی!', 'پشت صحنهٔ دنیای صوتی IDEN');
    });
}

// 🥚 Easter Egg #6: موس رو ۳ ثانیه روی فوتتر نگه دار
function initFooterEasterEgg() {
    const footer = document.querySelector('.footer');
    const egg = document.getElementById('easterEgg');
    if (!footer || !egg) return;
    
    let footerTimer;
    
    footer.addEventListener('mouseenter', () => {
        footerTimer = setTimeout(() => {
            activateEasterEgg(egg, '© IDEN — Since Day One');
            showNotification('🕰️', 'راز فوتتر', 'از روز اول...');
        }, 3000);
    });
    
    footer.addEventListener('mouseleave', () => {
        clearTimeout(footerTimer);
    });
}

// Helper: Activate easter egg display
function activateEasterEgg(element, text) {
    if (!element) return;
    element.querySelector('span').textContent = text;
    element.classList.add('active');
    setTimeout(() => element.classList.remove('active'), 3000);
}

/* =====================================================
   SECRET CONSOLE MESSAGE
===================================================== */
function initSecretConsole() {
    console.log(
        '%c🖤 IDEN — Sonic Universe %c| %cOfficial Website',
        'font-size:24px; font-weight:bold; color:#fff;',
        '',
        'font-size:14px; color:#999;'
    );
    console.log(
        '%cاگر اینو می‌بینی، پس اهل فنی! %c😎%c\n%cIDEN You Are Crazy %c— این یه ایستر اگه.',
        'color:#888;',
        '',
        '',
        'color:#fff; font-weight:bold; font-size:16px;',
        'color:#666;'
    );
    console.log(
        '%cبیا باهم یه کار خفن بزنیم → %ccontact@idenmusic.com',
        'color:#888;',
        'color:#fff; text-decoration:underline;'
    );
}

/* =====================================================
   SOUND EFFECTS
===================================================== */
function initSoundEffects() {
    const sfxHover = document.getElementById('sfxHover');
    const sfxClick = document.getElementById('sfxClick');
    if (!sfxHover || !sfxClick) return;
    
    const interactiveEls = document.querySelectorAll('a, button, .expertise-card, .music-card, .social-link, .streaming-card');
    
    interactiveEls.forEach(el => {
        el.addEventListener('mouseenter', () => {
            sfxHover.currentTime = 0;
            sfxHover.volume = 0.2;
            sfxHover.play().catch(() => {});
        });
        el.addEventListener('click', () => {
            sfxClick.currentTime = 0;
            sfxClick.volume = 0.3;
            sfxClick.play().catch(() => {});
        });
    });
}