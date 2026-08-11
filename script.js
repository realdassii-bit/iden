document.addEventListener('DOMContentLoaded',()=>{
    initSecurity();
    initPreloader();
    initParticles();
    initReveal();
    initNav();
    initSmoothScroll();
    initTypewriter();
    initCounter();
    initEasterEggs();
});

/* =====================================================
   SECURITY
===================================================== */
function initSecurity(){
    document.addEventListener('contextmenu',e=>{e.preventDefault();notif('⛔','دسترسی محدود','کلیک راست غیرفعال است.')});
    document.addEventListener('keydown',e=>{
        if(e.key==='F12'||(e.ctrlKey&&e.shiftKey&&['I','J','C'].includes(e.key.toUpperCase()))||(e.ctrlKey&&['U','S'].includes(e.key.toUpperCase()))){
            e.preventDefault();notif('🔒','دسترسی محدود','ابزارهای توسعه‌دهنده غیرفعال هستند.');
        }
    });
    setInterval(()=>{if(window.outerWidth-window.innerWidth>160||window.outerHeight-window.innerHeight>160)notif('🛡️','هشدار','Developer Tools را ببندید.')},1000);
}

function notif(icon,title,msg){
    const c=document.getElementById('notifContainer');
    const d=document.createElement('div');d.className='notif';
    d.innerHTML=`<span class="notif-icon">${icon}</span><div><h4>${title}</h4><p>${msg}</p></div>`;
    c.appendChild(d);
    setTimeout(()=>{d.classList.add('removing');setTimeout(()=>d.remove(),300)},4000);
    d.addEventListener('click',()=>{d.classList.add('removing');setTimeout(()=>d.remove(),300)});
}

/* =====================================================
   PRELOADER
===================================================== */
function initPreloader(){
    const p=document.getElementById('preloader'),bar=document.getElementById('preloaderFill');
    if(!p)return;
    let w=0;
    const i=setInterval(()=>{w+=Math.random()*18;if(w>100)w=100;bar.style.width=w+'%';if(w>=100){clearInterval(i);setTimeout(()=>p.classList.add('hidden'),400)}},200);
    setTimeout(()=>{if(!p.classList.contains('hidden'))p.classList.add('hidden')},2500);
}

/* =====================================================
   PARTICLES
===================================================== */
function initParticles(){
    const c=document.getElementById('particleCanvas');
    if(!c)return;
    const ctx=c.getContext('2d');
    let p=[];
    function r(){c.width=innerWidth;c.height=innerHeight}
    r();addEventListener('resize',r);
    class P{constructor(){this.x=Math.random()*c.width;this.y=Math.random()*c.height;this.s=Math.random()*1.5+.5;this.vx=(Math.random()-.5)*.3;this.vy=(Math.random()-.5)*.3;this.o=Math.random()*.3+.1}
    u(){this.x+=this.vx;this.y+=this.vy;if(this.x<0||this.x>c.width||this.y<0||this.y>c.height){this.x=Math.random()*c.width;this.y=Math.random()*c.height}}
    d(){ctx.beginPath();ctx.arc(this.x,this.y,this.s,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${this.o})`;ctx.fill()}}
    for(let i=0;i<60;i++)p.push(new P());
    (function a(){ctx.clearRect(0,0,c.width,c.height);p.forEach(x=>{x.u();x.d()});requestAnimationFrame(a)})();
}

/* =====================================================
   REVEAL
===================================================== */
function initReveal(){
    new IntersectionObserver(e=>{e.forEach(x=>{if(x.isIntersecting)x.target.classList.add('visible')})},{threshold:.15}).observe(document.querySelector('.reveal')?.parentElement||document.body);
    document.querySelectorAll('.reveal').forEach(el=>new IntersectionObserver(e=>{if(e[0].isIntersecting)el.classList.add('visible')},{threshold:.15}).observe(el));
}

/* =====================================================
   NAV
===================================================== */
function initNav(){
    const b=document.getElementById('navBtn'),m=document.getElementById('navPanel');
    if(!b||!m)return;
    b.addEventListener('click',()=>{b.classList.toggle('active');m.classList.toggle('active');document.body.style.overflow=m.classList.contains('active')?'hidden':''});
    m.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{b.classList.remove('active');m.classList.remove('active');document.body.style.overflow=''}));
}

/* =====================================================
   SMOOTH SCROLL
===================================================== */
function initSmoothScroll(){
    document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',function(e){const t=document.querySelector(this.getAttribute('href'));if(t){e.preventDefault();scrollTo({top:t.offsetTop-70,behavior:'smooth'})}}));
}

/* =====================================================
   TYPEWRITER
===================================================== */
function initTypewriter(){
    const el=document.getElementById('typewriter');
    if(!el)return;
    const phrases=['آهنگساز . پرودیوسر . هنرمند مستقل','ساختن صدا، فضا و هویت','جایی که موسیقی احساس می‌شود','IDEN You Are Crazy'];
    let pi=0,ci=0,del=false;
    function t(){
        const cur=phrases[pi];
        if(!del){el.innerHTML=cur.substring(0,ci+1)+'<span class="cursor"></span>';ci++;if(ci===cur.length){setTimeout(()=>{del=true;t()},2000);return}}
        else{el.innerHTML=cur.substring(0,ci-1)+'<span class="cursor"></span>';ci--;if(ci===0){del=false;pi=(pi+1)%phrases.length;setTimeout(t,500);return}}
        setTimeout(t,del?40:80);
    }
    t();
}

/* =====================================================
   COUNTER
===================================================== */
function initCounter(){
    document.querySelectorAll('.counter').forEach(c=>{
        const t=parseInt(c.getAttribute('data-target'));
        if(isNaN(t))return;
        new IntersectionObserver(e=>{if(e[0].isIntersecting){let s=0;const i=setInterval(()=>{s+=Math.ceil(t/50);if(s>=t){s=t;clearInterval(i)}c.textContent=s},30)}},{threshold:.5}).observe(c);
    });
}

/* =====================================================
   EASTER EGGS
===================================================== */
function initEasterEggs(){
    const egg=document.getElementById('easterPopup');
    if(!egg)return;
    const show=(txt)=>{egg.querySelector('span').textContent=txt;egg.classList.add('active');setTimeout(()=>egg.classList.remove('active'),3000)};
    
    // Type "iden"
    let buf='';
    document.addEventListener('keypress',e=>{
        if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
        buf+=e.key.toLowerCase();if(buf.length>4)buf=buf.slice(-4);
        if(buf==='iden'){show('IDEN You Are Crazy');buf='';notif('🥚','ایستر اگ!','راز اول رو پیدا کردی')}
        if(buf==='dany'||buf==='dani'){show('✨ Daniyal Sobeii ✨');buf='';notif('💎','اسم واقعی!','دانیال سبیعی')}
        if(buf==='musi'){document.body.style.transition='all .5s';document.body.style.background='#fff';document.body.style.color='#000';setTimeout(()=>{document.body.style.background='';document.body.style.color=''},500);buf=''}
    });
    
    // Konami
    const code=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];let ki=0;
    document.addEventListener('keydown',e=>{
        if(e.key===code[ki]){ki++;if(ki===code.length){show('🎮 KONAMI!');ki=0;notif('🎮','کونامی!','کد مخفی فعال شد 🌈');let h=0;const r=setInterval(()=>{document.body.style.filter=`hue-rotate(${h}deg)`;h=(h+10)%360},50);setTimeout(()=>{clearInterval(r);document.body.style.filter=''},3000)}}
        else ki=0;
    });
    
    // Double click hero image
    document.querySelector('.hero-img')?.addEventListener('dblclick',()=>{show('📸 Behind the Sound');notif('📸','پشت صحنه','دنیای صوتی IDEN')});
    
    // 10 clicks logo
    const logo=document.querySelector('.nav-logo');let lc=0,lt;
    if(logo){logo.addEventListener('click',e=>{e.preventDefault();lc++;clearTimeout(lt);if(lc===5)notif('👀','کنجکاوی','داری نزدیک میشی...');if(lc>=10){show('🌟 IDEN — World of Sound');lc=0}lt=setTimeout(()=>lc=0,3000)})}
    
    // Console
    console.log('%c🖤 IDEN %c| %cSonic Universe','font-size:22px;font-weight:bold;color:#fff','','color:#999');
    console.log('%cIDEN You Are Crazy %c— Easter Egg','color:#fff;font-weight:bold','color:#666');
    console.log('%c📧 contact@idenmusic.com','color:#888');
}