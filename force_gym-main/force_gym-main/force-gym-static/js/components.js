// components.js
const ComponentsModule = (function() {
  async function injectPartials() {
    const navbarPlaceholder = document.getElementById('site-navbar');
    const footerPlaceholder = document.getElementById('site-footer');

    if (navbarPlaceholder) {
      const resp = await fetch('partials/navbar.html');
      const html = await resp.text();
      navbarPlaceholder.innerHTML = html;
    }

    if (footerPlaceholder) {
      const resp = await fetch('partials/footer.html');
      const html = await resp.text();
      footerPlaceholder.innerHTML = html;
    }

    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  }

  function initMobileMenu() {
    const toggler = document.getElementById('navToggler');
    const menu = document.getElementById('navbar-menu');
    if (!toggler || !menu) return;

    toggler.addEventListener('click', () => {
      const expanded = toggler.getAttribute('aria-expanded') === 'true' ? false : true;
      toggler.setAttribute('aria-expanded', expanded);
      menu.classList.toggle('active');
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('active')) {
        menu.classList.remove('active');
        toggler.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !toggler.contains(e.target) && menu.classList.contains('active')) {
        menu.classList.remove('active');
        toggler.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  function initReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

    document.querySelectorAll('.section, .card, .facility-item, .hero-content').forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  return {
    injectPartials,
    initMobileMenu,
    initNavbarScroll,
    initReveal
  };
})();