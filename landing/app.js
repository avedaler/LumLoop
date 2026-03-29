// ============================================================
// LumLoop — App Logic
// ============================================================

(function() {
  'use strict';

  // Dark mode toggle
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);
  updateToggleIcon();

  if (toggle) {
    toggle.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      updateToggleIcon();
    });
  }

  function updateToggleIcon() {
    if (!toggle) return;
    toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
    toggle.innerHTML = theme === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  // Mobile menu
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', !isOpen);
      mobileNav.classList.toggle('open');
      mobileNav.setAttribute('aria-hidden', isOpen);
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Close mobile nav on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuBtn.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('open');
        mobileNav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  // Smooth scroll for anchor links (avoid hash routing issues)
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        // Close mobile nav if open
        if (mobileNav && mobileNav.classList.contains('open')) {
          menuBtn.setAttribute('aria-expanded', 'false');
          mobileNav.classList.remove('open');
          mobileNav.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }
      }
    });
  });

  // Scroll-reveal fallback for browsers without scroll-driven animations
  if (!CSS.supports('animation-timeline: scroll()')) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  // Header scroll behavior
  const header = document.getElementById('site-header');
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 80) {
      header.style.borderBottomColor = 'var(--color-divider)';
    } else {
      header.style.borderBottomColor = 'transparent';
    }
    
    lastScroll = currentScroll;
  }, { passive: true });

  // Waitlist form
  window.handleWaitlist = async function(e) {
    e.preventDefault();
    const email = document.getElementById('waitlist-email').value;
    if (email) {
      try {
        await fetch('./api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
      } catch (err) {}
      document.querySelector('.waitlist-form').style.display = 'none';
      const success = document.getElementById('waitlist-success');
      success.style.display = 'block';
      success.innerHTML = '<p>You\'re on the list. Redirecting to your dashboard...</p>';
      setTimeout(function() { window.location.href = './app'; }, 2000);
    }
  };

})();
