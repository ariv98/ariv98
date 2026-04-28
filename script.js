/* =====================================================
   ARIVAZHAGAN S — JARVIS HUD INTERACTIONS
   ===================================================== */

(() => {
  'use strict';

  // ---------- Year ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Navbar scroll + back-to-top ----------
  const navbar = document.querySelector('.navbar');
  const onScroll = () => {
    if (window.scrollY > 30) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    const btt = document.querySelector('.back-to-top');
    if (btt) {
      if (window.scrollY > 500) btt.classList.add('visible');
      else btt.classList.remove('visible');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Hamburger ----------
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => navLinks.classList.remove('open'))
    );
  }

  // ---------- Back to top ----------
  const btt = document.querySelector('.back-to-top');
  if (btt) {
    btt.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: 'smooth' })
    );
  }

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  // ---------- Scroll-spy: highlight current section in nav ----------
  const sectionIds = ['hero', 'about', 'skills', 'ai', 'education', 'experience', 'contact'];
  const navLinkMap = {};
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) navLinkMap[href.slice(1)] = a;
  });
  const setActive = (id) => {
    Object.values(navLinkMap).forEach((a) => a.classList.remove('active'));
    // hero shouldn't activate any link (no nav entry)
    if (navLinkMap[id]) navLinkMap[id].classList.add('active');
  };
  const updateActiveOnScroll = () => {
    const scrollY = window.scrollY + 120;
    let current = sectionIds[0];
    for (const id of sectionIds) {
      const sec = document.getElementById(id);
      if (sec && sec.offsetTop <= scrollY) current = id;
    }
    // near bottom -> contact
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 60) {
      current = 'contact';
    }
    setActive(current);
  };
  window.addEventListener('scroll', updateActiveOnScroll, { passive: true });
  updateActiveOnScroll();

  // ---------- Counter animation ----------
  const counters = document.querySelectorAll('.stat-value[data-target]');
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(tick);
  };
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          counterObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => counterObserver.observe(c));

  // ---------- Typing effect ----------
  const typedEl = document.getElementById('typed');
  if (typedEl) {
    const phrases = [
      'AI Systems Architect',
      'MCP & Agentic Workflow Specialist',
      'Building Agentic AI Systems',
      'Architecting 248+ MCP Tools',
      'Designing Custom Knowledge Engines',
      'Engineering Enterprise Java Platforms',
      'Mastering Copilot · Claude · SpecKit',
    ];
    let p = 0, c = 0, deleting = false;
    const type = () => {
      const word = phrases[p];
      if (!deleting) {
        typedEl.textContent = word.slice(0, ++c);
        if (c === word.length) {
          deleting = true;
          setTimeout(type, 1800);
          return;
        }
      } else {
        typedEl.textContent = word.slice(0, --c);
        if (c === 0) {
          deleting = false;
          p = (p + 1) % phrases.length;
        }
      }
      setTimeout(type, deleting ? 35 : 75);
    };
    type();
  }

  // ============== JARVIS PARTICLE NETWORK ==============
  const canvas = document.getElementById('bg-canvas');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    let particles = [];
    let rings = [];
    let mouse = { x: -9999, y: -9999, active: false };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Structured density — even full-width coverage with a few hero-area hubs layered on top
      const density = Math.min(250, Math.floor((w * h) / 6400));
      const hubs = [
        { x: w * 0.08, y: h * 0.26 },
        { x: w * 0.24, y: h * 0.70 },
        { x: w * 0.50, y: h * 0.22 },
        { x: w * 0.76, y: h * 0.68 },
        { x: w * 0.92, y: h * 0.30 },
      ];
      const bottomBandCount = Math.max(18, Math.floor(density * 0.12));
      const coverageCount = Math.floor((density - hubs.length - bottomBandCount) * 0.78);
      const clusteredCount = density - hubs.length - bottomBandCount - coverageCount;
      const columns = Math.max(8, Math.ceil(Math.sqrt(coverageCount * (w / h))));
      const rows = Math.max(5, Math.ceil(coverageCount / columns));
      const cellWidth = w / columns;
      const cellHeight = h / rows;

      particles = hubs.map((hub, index) => ({
        x: hub.x,
        y: hub.y,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        r: index === 4 ? 1.9 : 1.6,
        tone: index % 3 === 1 ? 'cyan' : 'gold',
        pulse: Math.random() * Math.PI * 2,
        hub: true,
      }));

      for (let row = 0; row < rows && particles.length < hubs.length + coverageCount; row++) {
        for (let col = 0; col < columns && particles.length < hubs.length + coverageCount; col++) {
          particles.push({
            x: col * cellWidth + (0.18 + Math.random() * 0.64) * cellWidth,
            y: row * cellHeight + (0.18 + Math.random() * 0.64) * cellHeight,
            vx: (Math.random() - 0.5) * 0.24,
            vy: (Math.random() - 0.5) * 0.24,
            r: Math.random() * 1.45 + 0.8,
            tone: Math.random() < 0.8 ? 'gold' : 'cyan',
            pulse: Math.random() * Math.PI * 2,
            hub: false,
          });
        }
      }

      for (let i = 0; i < clusteredCount; i++) {
        const hub = hubs[i % hubs.length];
        const angle = Math.random() * Math.PI * 2;
        const radius = 20 + Math.random() * 110;
        const x = Math.min(w - 10, Math.max(10, hub.x + Math.cos(angle) * radius));
        const y = Math.min(h - 10, Math.max(10, hub.y + Math.sin(angle) * radius));
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.32,
          vy: (Math.random() - 0.5) * 0.32,
          r: Math.random() * 1.8 + 0.9,
          tone: Math.random() < 0.76 ? 'gold' : 'cyan',
          pulse: Math.random() * Math.PI * 2,
          hub: false,
        });
      }

      for (let i = 0; i < bottomBandCount; i++) {
        particles.push({
          x: 10 + Math.random() * (w - 20),
          y: h * (0.78 + Math.random() * 0.18),
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.18,
          r: Math.random() * 1.55 + 0.85,
          tone: Math.random() < 0.82 ? 'gold' : 'cyan',
          pulse: Math.random() * Math.PI * 2,
          hub: false,
        });
      }

      // Holographic concentric rings (Jarvis arc reactor style)
      rings = [
        { r: 90,  speed: 0.0035, dash: [2, 8],   color: 'rgba(255, 184, 0, 0.55)', width: 1 },
        { r: 140, speed: -0.0022, dash: [10, 6], color: 'rgba(255, 184, 0, 0.35)', width: 1 },
        { r: 210, speed: 0.0014, dash: [4, 14],  color: 'rgba(0, 229, 255, 0.30)', width: 1 },
        { r: 290, speed: -0.0009, dash: [],      color: 'rgba(255, 184, 0, 0.18)', width: 0.8 },
      ];
    };

    const drawRings = (t) => {
      const cx = w / 2, cy = h / 2;
      for (const ring of rings) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * ring.speed);
        ctx.beginPath();
        ctx.setLineDash(ring.dash);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = ring.width;
        ctx.shadowColor = ring.color;
        ctx.shadowBlur = 12;
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    };

    const drawHudLink = (from, to, strokeStyle, lineWidth, isHubLink) => {
      const vx = to.x - from.x;
      const vy = to.y - from.y;
      const segmentRatio = isHubLink ? 0.34 : 0.26;
      const midX = from.x + vx * 0.5;
      const midY = from.y + vy * 0.5;

      const fromSegX = from.x + vx * segmentRatio;
      const fromSegY = from.y + vy * segmentRatio;
      const toSegX = to.x - vx * segmentRatio;
      const toSegY = to.y - vy * segmentRatio;

      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(fromSegX, fromSegY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(toSegX, toSegY);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      ctx.fillStyle = strokeStyle;
      ctx.beginPath();
      ctx.arc(midX, midY, isHubLink ? 1.4 : 1, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = (timestamp) => {
      ctx.clearRect(0, 0, w, h);

      // Center reactor rings
      drawRings(timestamp || 0);

      // Update particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.pulse += 0.085;
      }

      // Connections — nearest-neighbor links keep clusters readable instead of turning into a random web
      const maxDist = 165;
      const maxDist2 = maxDist * maxDist;
      const maxLinksPerParticle = 3;
      const linkCounts = new Array(particles.length).fill(0);
      const linkLimits = particles.map((particle) => particle.hub ? 6 : maxLinksPerParticle);
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        if (linkCounts[i] >= linkLimits[i]) continue;

        const candidates = [];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          if (linkCounts[j] >= linkLimits[j]) continue;
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxDist2) {
            candidates.push({ j, d2 });
          }
        }

        candidates.sort((left, right) => left.d2 - right.d2);

        for (const candidate of candidates) {
          if (linkCounts[i] >= linkLimits[i]) break;
          if (linkCounts[candidate.j] >= linkLimits[candidate.j]) continue;

          const b = particles[candidate.j];
          const d = Math.sqrt(candidate.d2);
          const isHubLink = a.hub || b.hub;
          const alpha = Math.pow(1 - d / maxDist, 1.15) * (isHubLink ? 0.78 : 0.48);
          const useCyan = a.tone === 'cyan' && b.tone === 'cyan';
          const strokeStyle = useCyan
            ? `rgba(0, 229, 255, ${alpha})`
            : `rgba(255, 184, 0, ${alpha})`;
          drawHudLink(a, b, strokeStyle, isHubLink ? 1.05 : 0.72, isHubLink);

          linkCounts[i] += 1;
          linkCounts[candidate.j] += 1;
        }

        // Mouse interaction line — gentler beam
        if (mouse.active) {
          const dx = a.x - mouse.x;
          const dy = a.y - mouse.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 170) {
            const alpha = (1 - d / 170) * 0.55;
            ctx.strokeStyle = `rgba(255, 213, 74, ${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // Draw glowing particles on top — brighter hub halos make the structure obvious
      for (const p of particles) {
        const pulse = 0.74 + Math.sin(p.pulse) * 0.38;
        const r = p.r * pulse;
        const color = p.tone === 'gold' ? '255, 184, 0' : '0, 229, 255';
        const glowRadius = p.hub ? r * 5.6 : r * 5.4;

        // Outer glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        grad.addColorStop(0, `rgba(${color}, ${p.hub ? 0.78 : 0.78})`);
        grad.addColorStop(0.45, `rgba(${color}, ${p.hub ? 0.18 : 0.20})`);
        grad.addColorStop(1, `rgba(${color}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Solid core
        ctx.fillStyle = `rgba(${color}, 0.98)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.hub ? r * 1.02 : r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mouse cursor reactor glow
      if (mouse.active) {
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 60);
        grad.addColorStop(0, 'rgba(255, 184, 0, 0.35)');
        grad.addColorStop(0.5, 'rgba(255, 184, 0, 0.1)');
        grad.addColorStop(1, 'rgba(255, 184, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 60, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });
    window.addEventListener('mouseleave', () => { mouse.active = false; });
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    }, { passive: true });
    window.addEventListener('touchend', () => { mouse.active = false; });

    resize();
    requestAnimationFrame(draw);
  }

  // ---------- Smooth anchor scroll offset ----------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ============================================================
  // ✨ JARVIS HUD ENHANCEMENTS
  // ============================================================

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Scroll progress beam ----------
  const beam = document.createElement('div');
  beam.className = 'scroll-beam';
  document.body.appendChild(beam);
  const updateBeam = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? (window.scrollY / h) * 100 : 0;
    beam.style.width = p + '%';
  };
  window.addEventListener('scroll', updateBeam, { passive: true });
  updateBeam();

  // ---------- Live HUD widget ----------
  const hud = document.createElement('div');
  hud.className = 'hud-widget';
  hud.innerHTML = `
    <div class="hud-row"><span class="hud-key">SYS</span><span class="hud-val hud-online">● ONLINE</span></div>
    <div class="hud-row"><span class="hud-key">LOC</span><span class="hud-val" id="hud-section">HERO</span></div>
    <div class="hud-row"><span class="hud-key">PRG</span><span class="hud-val" id="hud-progress">0%</span></div>
    <div class="hud-row"><span class="hud-key">UTC</span><span class="hud-val" id="hud-time">--:--:--</span></div>
  `;
  document.body.appendChild(hud);
  const hudSection = hud.querySelector('#hud-section');
  const hudProgress = hud.querySelector('#hud-progress');
  const hudTime = hud.querySelector('#hud-time');
  const updateHud = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? Math.round((window.scrollY / h) * 100) : 0;
    hudProgress.textContent = p + '%';
    const active = document.querySelector('.nav-links a.active');
    hudSection.textContent = (active ? active.textContent : 'HERO').toUpperCase();
  };
  window.addEventListener('scroll', updateHud, { passive: true });
  setInterval(() => {
    const d = new Date();
    hudTime.textContent = d.toUTCString().split(' ')[4];
  }, 1000);
  updateHud();

  // ---------- 3D Tilt for cards ----------
  if (!reduceMotion) {
    const tiltCards = document.querySelectorAll('.ai-card, .skill-card, .contact-card, .edu-card');
    tiltCards.forEach((card) => {
      card.classList.add('tilt');
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (py - 0.5) * -8;
        const ry = (px - 0.5) * 10;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ---------- Magnetic buttons ----------
  if (!reduceMotion) {
    document.querySelectorAll('.btn, .back-to-top').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  // ---------- Hero spotlight ----------
  const hero = document.getElementById('hero');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100) + '%');
      hero.style.setProperty('--sy', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  }

  // ---------- Glitch effect on hero title hover ----------
  const heroTitle = document.querySelector('.hero-title .gradient-text');
  if (heroTitle) {
    const original = heroTitle.textContent;
    heroTitle.setAttribute('data-text', original);
    heroTitle.classList.add('glitch');
  }
})();
