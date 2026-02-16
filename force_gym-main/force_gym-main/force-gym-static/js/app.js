// app.js
(async function() {
  // Load partials
  await ComponentsModule.injectPartials();

  // Initialize UI components after partials are injected
  ComponentsModule.initMobileMenu();
  ComponentsModule.initNavbarScroll();
  ComponentsModule.initReveal();

  const currentLang = I18nModule.currentLang();
  await I18nModule.loadContent(currentLang);

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function updateUI() {
    const content = I18nModule.getContent();
    if (!content) return;

    // Update data-i18n text
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = key.split('.').reduce((obj, k) => obj && obj[k], content);
      if (value) el.textContent = value;
    });

    // Update data-i18n-alt (for image alt)
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const key = el.getAttribute('data-i18n-alt');
      const value = key.split('.').reduce((obj, k) => obj && obj[k], content);
      if (value) el.alt = value;
    });

    // Update data-i18n-aria
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      const value = key.split('.').reduce((obj, k) => obj && obj[k], content);
      if (value) el.setAttribute('aria-label', value);
    });

    // Update phone and links
    const phone = content.phone;
    const phoneFormatted = content.phoneFormatted || phone;
    const phone2 = content.phone2;
    const phone2Formatted = content.phone2Formatted || phone2;
    const whatsappLink = content.whatsappLink || `https://wa.me/20${phone.slice(1)}`;
    const whatsappLink2 = content.whatsappLink2 || `https://wa.me/20${phone2.slice(1)}`;
    const mapsLink = content.mapsLink;

    document.querySelectorAll('a[href^="tel:"]').forEach(a => {
      a.href = `tel:+20${phone.slice(1)}`;
    });
    document.querySelectorAll('#cta-call, #hero-call, #footer-phone, #contact-phone').forEach(el => {
      if (el.tagName === 'A') el.href = `tel:+20${phone.slice(1)}`;
      if (el.id === 'footer-phone' || el.id === 'contact-phone') el.textContent = phoneFormatted;
    });
    document.querySelectorAll('#footer-phone2').forEach(el => {
      if (el.tagName === 'A') el.href = `tel:+20${phone2.slice(1)}`;
      el.textContent = phone2Formatted;
    });
    document.querySelectorAll('#cta-whatsapp, #hero-whatsapp').forEach(a => {
      a.href = whatsappLink;
    });
    document.querySelectorAll('#cta-whatsapp2, #hero-whatsapp2').forEach(a => {
      a.href = whatsappLink2;
    });
    document.querySelectorAll('#cta-directions, #hero-directions, #location-directions').forEach(a => {
      a.href = mapsLink;
    });

    // Social links
    const instaLink = document.querySelector('a[href*="instagram"]');
    const fbLink = document.querySelector('a[href*="facebook"]');
    if (instaLink && content.social.instagram) instaLink.href = content.social.instagram;
    if (fbLink && content.social.facebook) fbLink.href = content.social.facebook;

    // SEO
    document.title = content.seo.title || 'Force Gym';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', content.seo.description || '');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    
    if (ogTitle) ogTitle.setAttribute('content', content.seo.title || '');
    if (ogDesc) ogDesc.setAttribute('content', content.seo.description || '');
    if (ogUrl) ogUrl.setAttribute('content', content.seo.ogUrl || '');
    if (ogImage && content.seo.ogImage) ogImage.setAttribute('content', content.seo.ogImage);

    // Update copyright year in footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Update language toggle label
    const langToggleLabel = document.getElementById('lang-toggle-label');
    if (langToggleLabel) {
      langToggleLabel.textContent = I18nModule.currentLang() === 'en' ? 'عربي' : 'EN';
    }

    // Handle flag-based sections
    const flags = content.flags || {};
    document.querySelectorAll('[data-flag]').forEach(el => {
      const flagName = el.getAttribute('data-flag');
      if (!flags[flagName]) {
        el.style.display = 'none';
      }
    });

    // Copy buttons (including second phone)
    const copyButtons = ['copy-phone', 'copy-address', 'copy-phone-contact', 'copy-address-contact', 'copy-phone2'];
    copyButtons.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        // Remove existing listener to avoid duplicates (simple approach: replace with new one)
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', () => {
          if (id.includes('phone2')) {
            navigator.clipboard.writeText(phone2Formatted).then(() => {
              showToast(content.cta.copied || 'Copied!');
            });
          } else if (id.includes('phone')) {
            navigator.clipboard.writeText(phoneFormatted).then(() => {
              showToast(content.cta.copied || 'Copied!');
            });
          } else if (id.includes('address')) {
            navigator.clipboard.writeText(content.address).then(() => {
              showToast(content.cta.copied || 'Copied!');
            });
          }
        });
      }
    });
  }

  updateUI();

  I18nModule.subscribe(async (newLang) => {
    await I18nModule.loadContent(newLang);
    updateUI();
  });

  // Language toggle
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'language-toggle') {
      const newLang = I18nModule.currentLang() === 'en' ? 'ar' : 'en';
      I18nModule.setLang(newLang);
    }
  });

  // Active nav highlight
  function setActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar-menu a');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath) {
        link.classList.add('nav-active');
      } else {
        link.classList.remove('nav-active');
      }
    });
  }
  setActiveNav();

  // Smooth scroll for anchor links
  document.querySelectorAll('.nav-smooth').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Close mobile menu on link click
  const navMenu = document.getElementById('navbar-menu');
  if (navMenu) {
    navMenu.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && window.innerWidth <= 768) {
        navMenu.classList.remove('active');
        const toggler = document.getElementById('navToggler');
        if (toggler) toggler.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Hero video handling
  const video = document.querySelector('.hero-video');
  const fallback = document.querySelector('.hero-fallback');
  if (video) {
    // Check for reduced motion / save data
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || (navigator.connection && navigator.connection.saveData)) {
      video.style.display = 'none';
      if (fallback) fallback.style.display = 'block';
    } else {
      // Attempt to play
      video.play().catch(() => {
        video.style.display = 'none';
        if (fallback) fallback.style.display = 'block';
      });
    }
  }

  // Schedule page logic
  if (window.location.pathname.includes('schedule.html')) {
    const scheduleDisplay = document.getElementById('schedule-display');
    if (scheduleDisplay) {
      const scheduleData = await DataModule.getSchedule();
      if (scheduleData && scheduleData.length > 0) {
        let tableHtml = '<table class="schedule-table"><thead><tr><th>Day</th><th>Class</th><th>Time</th></tr></thead><tbody>';
        scheduleData.forEach(item => {
          tableHtml += `<tr><td>${item.day}</td><td>${item.class}</td><td>${item.time}</td></tr>`;
        });
        tableHtml += '</tbody></table>';
        scheduleDisplay.innerHTML = tableHtml;
      } else {
        scheduleDisplay.innerHTML = '<p class="schedule-placeholder">Schedule coming soon</p>';
      }
    }
  }

  // JSON-LD LocalBusiness on home only
  if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
    const content = I18nModule.getContent();
    if (content) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": content.siteName,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "14 Al-Maqrizi St",
          "addressLocality": "Manshiyet el Bakri, Heliopolis",
          "addressRegion": "Cairo",
          "postalCode": "11774",
          "addressCountry": "EG"
        },
        "telephone": `+20${content.phone.slice(1)}`,
        "sameAs": [
          content.social.instagram,
          content.social.facebook
        ]
      };
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }
})();