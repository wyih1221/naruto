/* NARUTO · 忍界 —— 交互脚本 */
/* ================= LOADER ================= */
(function(){
  document.body.style.overflow = 'hidden';
  let hidden = false;
  function hideLoader(){
    if (hidden) return;
    hidden = true;
    const l = document.getElementById('loader');
    l.classList.add('done');
    document.body.style.overflow = '';
  }
  window.addEventListener('load', () => setTimeout(hideLoader, 900));
  document.addEventListener('DOMContentLoaded', () => setTimeout(hideLoader, 2100));
  setTimeout(hideLoader, 3000); // hard fallback
})();

/* ================= LEAF CANVAS ================= */
(function(){
  const canvas = document.getElementById('leafCanvas');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  const leaves = [], embers = [];

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#ff7a18','#ffb347','#c2410c','#d92b2b','#e8892b','#8a5a1e'];

  function makeLeaf(){
    return {
      x: Math.random() * W,
      y: Math.random() * -H,
      size: 5 + Math.random() * 11,
      vy: .35 + Math.random() * .95,
      vx: -.25 + Math.random() * .5,
      rot: Math.random() * Math.PI * 2,
      vr: (-.012 + Math.random() * .024),
      sway: Math.random() * Math.PI * 2,
      swaySpd: .008 + Math.random() * .018,
      swayAmp: .35 + Math.random() * .9,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      alpha: .25 + Math.random() * .55
    };
  }
  function makeEmber(){
    return {
      x: Math.random() * W, y: H + Math.random() * 200,
      size: .8 + Math.random() * 2.2,
      vy: -(.25 + Math.random() * .8),
      vx: -.3 + Math.random() * .6,
      alpha: .2 + Math.random() * .6,
      phase: Math.random() * Math.PI * 2
    };
  }
  const LEAF_COUNT = window.innerWidth < 760 ? 26 : 54;
  const EMBER_COUNT = window.innerWidth < 760 ? 16 : 38;
  for (let i = 0; i < LEAF_COUNT; i++) leaves.push(makeLeaf());
  for (let i = 0; i < EMBER_COUNT; i++) embers.push(makeEmber());

  function drawLeaf(l){
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.rot);
    ctx.globalAlpha = l.alpha;
    ctx.fillStyle = l.color;
    // leaf: two arcs forming a lens shape
    ctx.beginPath();
    ctx.moveTo(0, -l.size);
    ctx.quadraticCurveTo(l.size * .78, -l.size * .12, 0, l.size);
    ctx.quadraticCurveTo(-l.size * .78, -l.size * .12, 0, -l.size);
    ctx.fill();
    // midrib
    ctx.globalAlpha = l.alpha * .55;
    ctx.strokeStyle = 'rgba(30,10,0,.8)';
    ctx.lineWidth = .7;
    ctx.beginPath(); ctx.moveTo(0, -l.size * .9); ctx.lineTo(0, l.size * .9); ctx.stroke();
    ctx.restore();
  }

  let t = 0;
  function loop(){
    ctx.clearRect(0, 0, W, H);
    t += .016;

    for (const l of leaves){
      l.sway += l.swaySpd;
      l.x += l.vx + Math.sin(l.sway) * l.swayAmp;
      l.y += l.vy;
      l.rot += l.vr;
      if (l.y - 30 > H || l.x < -60 || l.x > W + 60){
        Object.assign(l, makeLeaf());
        l.y = -30; l.x = Math.random() * W;
      }
      drawLeaf(l);
    }

    for (const e of embers){
      e.phase += .03;
      e.x += e.vx + Math.sin(e.phase) * .35;
      e.y += e.vy;
      if (e.y < -20){
        Object.assign(e, makeEmber());
        e.y = H + 20; e.x = Math.random() * W;
      }
      ctx.globalAlpha = e.alpha * (.55 + .45 * Math.sin(e.phase * 1.7));
      ctx.fillStyle = '#ffb347';
      ctx.shadowBlur = 8; ctx.shadowColor = '#ff7a18';
      ctx.beginPath(); ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ================= REVEAL ================= */
(function(){
  const items = [...document.querySelectorAll('.reveal')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en, i) => {
      if (en.isIntersecting){
        const el = en.target;
        const siblings = [...(el.parentElement ? el.parentElement.children : [])].filter(c => c.classList && c.classList.contains('reveal'));
        const idx = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = Math.min(idx * 80, 400) + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      }
    });
  }, { threshold: .14, rootMargin: '0px 0px -8% 0px' });
  items.forEach(el => io.observe(el));
})();

/* ================= NAV / PROGRESS ================= */
(function(){
  const nav = document.getElementById('nav');
  const bar = document.getElementById('progressBar');
  const links = [...document.querySelectorAll('.nav-links a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

  function onScroll(){
    const y = window.scrollY;
    nav.classList.toggle('solid', y > 40);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    let active = sections[0];
    sections.forEach(s => {
      if (s.getBoundingClientRect().top <= window.innerHeight * .38) active = s;
    });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + (active ? active.id : '')));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ================= COUNTERS ================= */
(function(){
  const nums = [...document.querySelectorAll('.num[data-to]')];
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const to = parseInt(el.dataset.to, 10);
      const dur = 1600;
      const start = performance.now();
      function step(now){
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const v = Math.round(to * ease);
        el.textContent = v.toLocaleString('en-US');
        if (to >= 1000 && v >= 1000) el.innerHTML = v.toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: .6 });
  nums.forEach(n => io.observe(n));
})();

/* ================= TYPEWRITER QUOTE ================= */
(function(){
  const el = document.getElementById('quoteText');
  const cite = document.getElementById('quoteCite');
  const text = el.dataset.text;
  let done = false;
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting || done) return;
      done = true;
      let i = 0;
      el.textContent = '';
      const cursor = document.createElement('span');
      cursor.className = 'cur';
      cursor.textContent = '▍';
      el.appendChild(cursor);
      const timer = setInterval(() => {
        i++;
        el.textContent = text.slice(0, i);
        el.appendChild(cursor);
        if (i >= text.length){
          clearInterval(timer);
          setTimeout(() => { cursor.remove(); cite.classList.add('show'); }, 500);
        }
      }, 62);
    });
  }, { threshold: .4 });
  io.observe(el);
})();

/* ================= CARD TILT ================= */
(function(){
  const cards = document.querySelectorAll('.ninja-card, .jutsu');
  const fine = window.matchMedia('(pointer:fine)').matches;
  if (!fine) return;
  cards.forEach(card => {
    let raf = null;
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', (px * 100) + '%');
      card.style.setProperty('--my', (py * 100) + '%');
      if (card.classList.contains('ninja-card') && !card.classList.contains('sharingan-card')){
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = `perspective(900px) rotateY(${(px - .5) * 9}deg) rotateX(${-(py - .5) * 9}deg) translateY(-8px)`;
        });
      }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ================= CLONE BURST (easter egg) ================= */
(function(){
  const chars = ['忍','影','分','身','之','术','火','木','叶','查','克','拉'];
  function burst(x, y, n){
    for (let i = 0; i < n; i++){
      const s = document.createElement('div');
      s.className = 'clone';
      s.textContent = chars[(Math.random() * chars.length) | 0];
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.fontSize = (16 + Math.random() * 26) + 'px';
      s.style.opacity = '1';
      document.body.appendChild(s);
      const ang = Math.random() * Math.PI * 2;
      const dist = 90 + Math.random() * 240;
      const dx = Math.cos(ang) * dist;
      const dy = Math.sin(ang) * dist;
      s.animate([
        { transform: 'translate(-50%,-50%) scale(.5) rotate(0deg)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${.9 + Math.random()}) rotate(${(Math.random() - .5) * 240}deg)`, opacity: 0 }
      ], { duration: 900 + Math.random() * 700, easing: 'cubic-bezier(.15,.75,.3,1)' })
        .onfinish = () => s.remove();
    }
  }
  const ras = document.getElementById('rasengan');
  ras.addEventListener('click', e => {
    const r = ras.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 18);
    ras.animate([
      { transform: 'scale(1.06)' }, { transform: 'scale(.88)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }
    ], { duration: 520, easing: 'ease-out' });
  });
  window.addEventListener('keydown', e => {
    if (e.key === 'k' || e.key === 'K'){
      burst(window.innerWidth / 2, window.innerHeight / 2, 24);
    }
  });
  // click anywhere on hero bg -> subtle burst
  document.querySelector('.hero').addEventListener('click', e => {
    if (e.target.closest('a') || e.target.closest('#rasengan')) return;
    burst(e.clientX, e.clientY, 6);
  });
})();

/* ================= HERO PARALLAX ================= */
(function(){
  const hero = document.querySelector('.hero');
  const title = document.querySelector('.hero-title');
  const orb = document.querySelector('.rasengan');
  const fine = window.matchMedia('(pointer:fine)').matches;
  if (!fine) return;
  hero.addEventListener('mousemove', e => {
    const cx = (e.clientX / window.innerWidth - .5);
    const cy = (e.clientY / window.innerHeight - .5);
    title.style.transform = `translate(${cx * -10}px, ${cy * -8}px)`;
    if (orb) orb.style.translate = `${cx * 18}px ${cy * 14}px`;
  });
})();
