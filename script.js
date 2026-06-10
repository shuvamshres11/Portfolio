/* =====================================================
   PORTFOLIO JAVASCRIPT
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // LOADER
  // ==========================================
  const loader = document.getElementById('loader');

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }, 1600);
  });

  // Prevent scroll during load
  document.body.style.overflow = 'hidden';

  // ==========================================
  // NAVBAR SCROLL
  // ==========================================
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ==========================================
  // MOBILE MENU
  // ==========================================
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    // Animate hamburger
    const spans = hamburger.querySelectorAll('span');
    if (mobileMenu.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // ==========================================
  // SCROLL REVEAL
  // ==========================================
  const revealEls = document.querySelectorAll('.section-header, .about-text, .about-image-col, .skill-category, .project-card, .timeline-item, .contact-left, .contact-form');
  
  revealEls.forEach(el => {
    el.setAttribute('data-reveal', '');
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, 60);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  // Stagger children in grids
  const staggerParents = document.querySelectorAll('.skills-grid, .about-stats, .contact-links');
  staggerParents.forEach(parent => {
    const children = parent.children;
    Array.from(children).forEach((child, i) => {
      child.setAttribute('data-reveal', '');
      child.style.transitionDelay = `${i * 0.08}s`;
      revealObserver.observe(child);
    });
  });

  // ==========================================
  // ACTIVE NAV LINK
  // ==========================================
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinksAll.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObserver.observe(s));

  // ==========================================
  // CONTACT FORM
  // ==========================================
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('contact-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name    = document.getElementById('cf-name').value.trim();
    const email   = document.getElementById('cf-email').value.trim();
    const message = document.getElementById('cf-message').value.trim();

    // ── Client-side validation ──────────────────────────
    if (!name || !email || !message) {
      setBtn('⚠ Please fill all fields', 'rgba(255,100,100,0.15)', '#ff8888');
      setTimeout(() => resetBtn(), 2500);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setBtn('⚠ Invalid email address', 'rgba(255,100,100,0.15)', '#ff8888');
      setTimeout(() => resetBtn(), 2500);
      return;
    }

    // ── Send to backend ─────────────────────────────────
    setBtn('Sending…', 'rgba(176,184,200,0.1)', 'var(--text-muted)');
    submitBtn.disabled = true;

    try {
      const res = await fetch('http://localhost:3001/send', {
        method  : 'POST',
        headers : { 'Content-Type': 'application/json' },
        body    : JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setBtn('✓ Message Sent!', 'rgba(100,200,120,0.15)', '#72c97a');
        form.reset();
        setTimeout(() => { resetBtn(); submitBtn.disabled = false; }, 4000);
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err) {
      const msg = err.message.includes('Failed to fetch')
        ? '⚠ Server offline — start the server first'
        : `⚠ ${err.message}`;
      setBtn(msg, 'rgba(255,100,100,0.15)', '#ff8888');
      setTimeout(() => { resetBtn(); submitBtn.disabled = false; }, 4000);
    }
  });

  function setBtn(text, bg, color) {
    submitBtn.textContent     = text;
    submitBtn.style.background = bg;
    submitBtn.style.color      = color;
  }

  function resetBtn() {
    submitBtn.textContent      = 'Send Message ✦';
    submitBtn.style.background = '';
    submitBtn.style.color      = '';
  }


  // ==========================================
  // SMOOTH ANCHOR SCROLLING
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const yOffset = -70;
        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // ==========================================
  // PARALLAX - subtle portrait effect
  // ==========================================
  const portrait = document.querySelector('.portrait-frame');
  if (portrait) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        portrait.style.transform = `translateY(${scrollY * 0.05}px)`;
      }
    });
  }

  // ==========================================
  // TYPED TEXT EFFECT on hero tagline
  // ==========================================
  const taglineEl = document.querySelector('.hero-tagline');
  if (taglineEl) {
    const originalText = taglineEl.textContent;
    taglineEl.style.minHeight = taglineEl.offsetHeight + 'px';
  }

  console.log('%c✦ Portfolio loaded!', 'color: #a8c5a0; font-size: 14px; font-weight: bold;');
  console.log('%cBuilt with HTML, CSS & Vanilla JS', 'color: #c8a882; font-size: 12px;');

});

// ==========================================
// MOBILE MENU CLOSE (exposed globally)
// ==========================================
function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobile-menu');
  const hamburger = document.getElementById('hamburger');
  mobileMenu.classList.remove('open');
  const spans = hamburger.querySelectorAll('span');
  spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}
