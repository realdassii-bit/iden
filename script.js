// Particles
(function(){
    var c=document.getElementById('bg');
    if(!c)return;
    var ctx=c.getContext('2d'),p=[];
    function r(){c.width=innerWidth;c.height=innerHeight}
    r();addEventListener('resize',r);
    for(var i=0;i<40;i++)p.push({x:Math.random()*c.width,y:Math.random()*c.height,s:Math.random()*1.5+.5,vx:(Math.random()-.5)*.2,vy:(Math.random()-.5)*.2});
    (function a(){ctx.clearRect(0,0,c.width,c.height);p.forEach(function(x){x.x+=x.vx;x.y+=x.vy;if(x.x<0||x.x>c.width)x.x=Math.random()*c.width;if(x.y<0||x.y>c.height)x.y=Math.random()*c.height;ctx.beginPath();ctx.arc(x.x,x.y,x.s,0,2*Math.PI);ctx.fillStyle='rgba(255,255,255,'+Math.random()*.3+')';ctx.fill()});requestAnimationFrame(a)})();
})();

// Security
document.addEventListener('contextmenu',function(e){e.preventDefault();notif('⛔','غیرفعال','کلیک راست غیرفعال است')});
document.addEventListener('keydown',function(e){if(e.key==='F12'||(e.ctrlKey&&e.shiftKey&&['I','J','C'].indexOf(e.key.toUpperCase())>-1)||(e.ctrlKey&&['U','S'].indexOf(e.key.toUpperCase())>-1)){e.preventDefault();notif('🔒','غیرفعال','ابزار توسعه غیرفعال است')}});

function notif(i,t,m){
    var b=document.getElementById('notifBox');
    var d=document.createElement('div');d.className='notif';
    d.innerHTML='<span>'+i+'</span><div><b>'+t+'</b><p>'+m+'</p></div>';
    b.appendChild(d);
    setTimeout(function(){d.classList.add('removing');setTimeout(function(){d.remove()},300)},3500);
}

// Loader
(function(){
    var l=document.getElementById('loader'),f=document.getElementById('loaderFill');
    if(!l)return;
    var w=0,i=setInterval(function(){w+=Math.random()*25;if(w>100)w=100;f.style.width=w+'%';if(w>=100){clearInterval(i);setTimeout(function(){l.classList.add('hidden')},300)}},150);
    setTimeout(function(){if(!l.classList.contains('hidden'))l.classList.add('hidden')},2000);
})();

// Nav
document.getElementById('navBurger').addEventListener('click',function(){
    document.getElementById('navMenu').classList.toggle('open');
    document.body.style.overflow=document.getElementById('navMenu').classList.contains('open')?'hidden':'';
});
document.querySelectorAll('.nav-menu a').forEach(function(a){
    a.addEventListener('click',function(){
        document.getElementById('navMenu').classList.remove('open');
        document.body.style.overflow='';
    });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
        var t=document.querySelector(this.getAttribute('href'));
        if(t){e.preventDefault();window.scrollTo({top:t.offsetTop-60,behavior:'smooth'})}
    });
});

// Easter eggs
(function(){
    var egg=document.getElementById('egg');
    if(!egg)return;
    var show=function(t){egg.querySelector('span').textContent=t;egg.classList.add('active');setTimeout(function(){egg.classList.remove('active')},2500)};
    var buf='';
    document.addEventListener('keypress',function(e){
        buf+=e.key.toLowerCase();if(buf.length>4)buf=buf.slice(-4);
        if(buf==='iden'){show('IDEN You Are Crazy');buf='';notif('🥚','Easter Egg!','پیداش کردی!')}
    });
    var code=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'],ki=0;
    document.addEventListener('keydown',function(e){
        if(e.key===code[ki]){ki++;if(ki===code.length){show('🎮 KONAMI! 🎮');ki=0;notif('🎮','Konami Code!','فعال شد!')}}else ki=0;
    });
    console.log('%cIDEN %c| %cSonic Universe\n%cIDEN You Are Crazy %c— Easter Egg\n%ccontact@idenmusic.com','font-size:20px;font-weight:bold;color:#fff','','color:#999','color:#fff;font-weight:bold','color:#666','color:#888');
})();
