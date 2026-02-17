// main.js (enhanced) — Force Gym refined UX with professional features

const DataModule = (function () {
  let contentCache = {};
  let scheduleCache = null;

  async function loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    return await response.json();
  }

  async function getContent(lang) {
    if (contentCache[lang]) return contentCache[lang];

    if (window.__FORCE_GYM_CONTENT__ && window.__FORCE_GYM_CONTENT__[lang]) {
      contentCache[lang] = window.__FORCE_GYM_CONTENT__[lang];
      return contentCache[lang];
    }

    try {
      const data = await loadJSON(`data/site.${lang}.json`);
      contentCache[lang] = data;
      return data;
    } catch (e) {
      console.error(e);
      if (lang !== "en") return getContent("en");
      return null;
    }
  }

  async function getSchedule() {
    if (scheduleCache) return scheduleCache;

    if (window.__FORCE_GYM_SCHEDULE__) {
      scheduleCache = window.__FORCE_GYM_SCHEDULE__;
      return scheduleCache;
    }

    try {
      const data = await loadJSON("data/schedule.json");
      scheduleCache = data;
      return data;
    } catch (e) {
      console.error(e);
      scheduleCache = [];
      return [];
    }
  }

  return { getContent, getSchedule };
})();

const I18nModule = (function () {
  let currentLang = localStorage.getItem("force-gym-lang") || "en";
  let content = null;
  let subscribers = [];

  function applyRootAttrs(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }

  function setLang(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem("force-gym-lang", lang);
    applyRootAttrs(lang);
    subscribers.forEach((cb) => cb(lang));
  }

  async function loadContent(lang) {
    content = await DataModule.getContent(lang);
    return content;
  }

  function getContent() {
    return content;
  }

  function subscribe(cb) {
    subscribers.push(cb);
  }

  applyRootAttrs(currentLang);

  return {
    currentLang: () => currentLang,
    setLang,
    loadContent,
    getContent,
    subscribe,
  };
})();

const ComponentsModule = (function () {
  async function injectPartials() {
    const navbarPlaceholder = document.getElementById("site-navbar");
    const footerPlaceholder = document.getElementById("site-footer");

    async function safeFetchText(url) {
      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return await resp.text();
      } catch {
        return null;
      }
    }

    if (navbarPlaceholder) {
      let html = (window.__FORCE_GYM_PARTIALS__ && window.__FORCE_GYM_PARTIALS__.navbar) || null;
      if (!html) html = await safeFetchText("partials/navbar.html");
      if (html) navbarPlaceholder.innerHTML = html;
    }

    if (footerPlaceholder) {
      let html = (window.__FORCE_GYM_PARTIALS__ && window.__FORCE_GYM_PARTIALS__.footer) || null;
      if (!html) html = await safeFetchText("partials/footer.html");
      if (html) footerPlaceholder.innerHTML = html;
    }

    const yearSpan = document.getElementById("current-year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  }

  // Enhanced mobile menu with focus trap
  function initMobileMenu() {
    const toggler = document.getElementById("navToggler");
    const menu = document.getElementById("navbar-menu");
    if (!toggler || !menu) return;

    let previouslyFocused = null;

    function closeMenu() {
      menu.classList.remove("active");
      toggler.setAttribute("aria-expanded", "false");
      if (previouslyFocused) {
        previouslyFocused.focus();
        previouslyFocused = null;
      }
    }

    function trapFocus(e) {
      if (!menu.classList.contains('active')) return;
      const focusable = menu.querySelectorAll('a, button, [tabindex="0"]');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    toggler.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("active");
      toggler.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (isOpen) {
        previouslyFocused = document.activeElement;
        const firstLink = menu.querySelector('a');
        if (firstLink) firstLink.focus();
      } else {
        toggler.focus();
      }
    });

    // Close on link click
    menu.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a && menu.classList.contains("active")) {
        closeMenu();
      }
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("active")) {
        closeMenu();
      }
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !toggler.contains(e.target) && menu.classList.contains("active")) {
        closeMenu();
      }
    });

    // Trap focus when menu open
    document.addEventListener('keydown', trapFocus);
  }

  function initReveal() {
    const elements = document.querySelectorAll(
      ".section, .card, .program-card, .facility-item, .gallery-item, .pricing-card, .benefit-card, .page-header"
    );
    if (!elements.length) return;

    elements.forEach(el => el.classList.add("reveal"));

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach(el => el.classList.add("in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    elements.forEach(el => observer.observe(el));
  }

  return { injectPartials, initMobileMenu, initReveal };
})();

// ==================== Toast singleton ====================
let toastRegion = null;
function getToastRegion() {
  if (!toastRegion) {
    toastRegion = document.getElementById('toast-region');
    if (!toastRegion) {
      toastRegion = document.createElement('div');
      toastRegion.id = 'toast-region';
      toastRegion.setAttribute('role', 'status');
      toastRegion.setAttribute('aria-live', 'polite');
      toastRegion.setAttribute('aria-atomic', 'true');
      toastRegion.className = 'toast';
      toastRegion.style.display = 'none';
      document.body.appendChild(toastRegion);
    }
  }
  return toastRegion;
}

function showToast(message) {
  const toast = getToastRegion();
  toast.textContent = message;
  toast.style.display = 'block';
  // trigger reflow
  void toast.offsetHeight;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.style.display = 'none';
    }, 200);
  }, 3000);
}

// ==================== Page Transitions ====================
function initPageTransitions() {
  // Start with page-loading then ready after frame
  document.body.classList.add('page-transition', 'page-loading');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.remove('page-loading');
      document.body.classList.add('page-ready');
    });
  });

  // Intercept internal navigation
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('wa.me') ||
        link.target === '_blank' ||
        link.hasAttribute('download')) return;

    // Same origin check
    try {
      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      if (!url.pathname.endsWith('.html') && !url.pathname.endsWith('/')) return; // only .html pages
    } catch {
      return;
    }

    e.preventDefault();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.location.href = href;
      return;
    }
    document.body.classList.add('is-navigating');
    setTimeout(() => {
      window.location.href = href;
    }, 140); // match CSS transition
  });

  // Handle BFCache
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      document.body.classList.remove('page-loading', 'is-navigating');
      document.body.classList.add('page-ready');
    }
  });
}

// ==================== Unified Scroll Handler ====================
let rafScheduled = false;
let lastScrollY = window.scrollY;
let ticking = false;

function updateScrollUI() {
  // navbar scrolled class
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    if (lastScrollY > 10) navbar.classList.add('navbar-scrolled');
    else navbar.classList.remove('navbar-scrolled');
  }

  // back-to-top visibility
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    if (lastScrollY > 500) backToTop.classList.add('visible');
    else backToTop.classList.remove('visible');
  }

  // scroll progress bar (guard against docHeight <= 0)
  const progressSpan = document.querySelector('.scroll-progress span');
  if (progressSpan) {
    const winHeight = document.documentElement.clientHeight;
    const docHeight = document.documentElement.scrollHeight - winHeight;
    let percent = 0;
    if (docHeight > 0) {
      percent = (lastScrollY / docHeight) * 100;
    }
    progressSpan.style.width = percent + '%';
  }

  ticking = false;
}

function onScroll() {
  lastScrollY = window.scrollY;
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateScrollUI();
      ticking = false;
    });
    ticking = true;
  }
}

function injectScrollProgress() {
  if (document.querySelector('.scroll-progress')) return;
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  const span = document.createElement('span');
  progress.appendChild(span);
  document.body.appendChild(progress);
}

function initBackToTop() {
  if (document.getElementById('back-to-top')) return;
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '↑';
  document.body.appendChild(btn);
  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  });
}

// ==================== Theme Toggle ====================
function initThemeToggle() {
  // Migrate old values
  let stored = localStorage.getItem('force-gym-theme');
  if (stored === 'light') stored = 'carbon';
  else if (stored === 'dark' || !stored) stored = 'force';
  localStorage.setItem('force-gym-theme', stored);
  document.documentElement.dataset.theme = stored;
  document.documentElement.style.colorScheme = 'dark';

  // Insert toggle in navbar before language toggle
  const navbarMenu = document.querySelector('.navbar-menu');
  if (!navbarMenu) return;
  if (document.querySelector('.theme-toggle-item')) return; // avoid duplicates

  const li = document.createElement('li');
  li.className = 'theme-toggle-item';
  const btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.setAttribute('aria-label', 'Toggle theme');
  btn.innerHTML = stored === 'force'
    ? '<span class="icon">🔥</span> Force'
    : '<span class="icon">🌊</span> Carbon';
  btn.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    const newTheme = current === 'force' ? 'carbon' : 'force';
    document.documentElement.dataset.theme = newTheme;
    localStorage.setItem('force-gym-theme', newTheme);
    btn.innerHTML = newTheme === 'force'
      ? '<span class="icon">🔥</span> Force'
      : '<span class="icon">🌊</span> Carbon';
  });
  li.appendChild(btn);

  // Find language toggle item
  const langItem = document.querySelector('.lang-item');
  if (langItem) {
    navbarMenu.insertBefore(li, langItem);
  } else {
    navbarMenu.appendChild(li);
  }
}

// ==================== Form Validation ====================
function setupFormValidation(formId, fields) {
  const form = document.getElementById(formId);
  if (!form) return;

  // Create error containers if not present
  fields.forEach(field => {
    const input = form.querySelector(`#${field.id}`);
    if (!input) return;
    const errorId = `error-${field.id}`;
    let errorDiv = document.getElementById(errorId);
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.id = errorId;
      errorDiv.className = 'field-error';
      errorDiv.setAttribute('role', 'alert');
      input.parentNode.insertBefore(errorDiv, input.nextSibling);
    }
  });

  function validateField(input) {
    const field = fields.find(f => f.id === input.id);
    if (!field) return true;

    const value = input.value.trim();
    const errorDiv = document.getElementById(`error-${input.id}`);
    let isValid = true;
    let errorMsg = '';

    if (field.required && !value) {
      isValid = false;
      errorMsg = field.requiredMessage || 'This field is required';
    } else if (field.pattern === 'egypt-phone') {
      const phoneDigits = value.replace(/\s+/g, '');
      if (!/^01[0-9]{9}$/.test(phoneDigits)) {
        isValid = false;
        errorMsg = field.patternMessage || 'Enter a valid Egyptian mobile number (11 digits starting with 01)';
      }
    } else if (field.minLength && value.length < field.minLength) {
      isValid = false;
      errorMsg = field.minLengthMessage || `Minimum ${field.minLength} characters`;
    }

    input.classList.toggle('is-invalid', !isValid);
    input.setAttribute('aria-invalid', !isValid);
    if (errorDiv) {
      errorDiv.textContent = errorMsg;
      errorDiv.classList.toggle('show', !isValid);
      if (!isValid) {
        input.setAttribute('aria-describedby', errorDiv.id);
      } else {
        input.removeAttribute('aria-describedby');
      }
    }
    return isValid;
  }

  form.addEventListener('input', (e) => {
    if (e.target.matches('input, select, textarea')) {
      validateField(e.target);
    }
  });

  form.__fgValidateAll = function() {
    let formValid = true;
    fields.forEach(field => {
      const input = form.querySelector(`#${field.id}`);
      if (input) {
        if (!validateField(input)) formValid = false;
      }
    });
    return formValid;
  };
}

// ==================== Form Handlers ====================
function initMembershipForm() {
  const membershipForm = document.getElementById("membershipForm");
  if (!membershipForm) return;

  setupFormValidation('membershipForm', [
    { id: 'req-name', required: true, minLength: 2, requiredMessage: 'Name is required', minLengthMessage: 'Name must be at least 2 characters' },
    { id: 'req-phone', required: true, pattern: 'egypt-phone', patternMessage: 'Enter a valid Egyptian mobile number (11 digits)' },
    { id: 'req-plan', required: true, requiredMessage: 'Please select a plan' }
  ]);

  membershipForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!membershipForm.__fgValidateAll()) {
      showToast("Please fix the highlighted fields");
      const firstInvalid = membershipForm.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const name = document.getElementById("req-name").value.trim();
    const phone = document.getElementById("req-phone").value.trim();
    const planIndex = document.getElementById("req-plan").value;
    const note = document.getElementById("req-note").value.trim();

    const content = I18nModule.getContent() || {};
    const plans = window.membershipPlans || [];
    const selectedPlan = plans[planIndex] ? plans[planIndex].name : "";

    const message = `Hi Force Gym, I'm interested in the membership offer.\nName: ${name}\nPhone: ${phone.replace(/\s+/g, '')}\nPlan: ${selectedPlan}\nNote: ${note || "None"}`;

    const whatsappLink = content.whatsappLink || "https://wa.me/201112622236";
    window.open(`${whatsappLink}?text=${encodeURIComponent(message)}`, "_blank");

    showToast(content.membership?.requestForm?.successToast || "Opening WhatsApp...");
  });
}

function initContactForm() {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  setupFormValidation('contactForm', [
    { id: 'name', required: true, minLength: 2, requiredMessage: 'Name is required', minLengthMessage: 'Name must be at least 2 characters' },
    { id: 'phone', required: true, pattern: 'egypt-phone', patternMessage: 'Enter a valid Egyptian mobile number (11 digits)' }
  ]);

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!contactForm.__fgValidateAll()) {
      showToast("Please fix the highlighted fields");
      const firstInvalid = contactForm.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const goal = document.getElementById("goal").value.trim();

    const content = I18nModule.getContent() || {};
    const msgTpl = content.contact?.whatsappMessage || "Hi Force Gym, I want to join.\nName: {name}\nPhone: {phone}\nGoal: {goal}";
    const message = msgTpl
      .replace("{name}", name)
      .replace("{phone}", phone.replace(/\s+/g, ''))
      .replace("{goal}", goal || (I18nModule.currentLang() === "ar" ? "غير محدد" : "Not specified"));

    const whatsappLink = content.whatsappLink || "https://wa.me/201112622236";
    window.open(`${whatsappLink}?text=${encodeURIComponent(message)}`, "_blank");

    showToast(content.contact?.successToast || "Opening WhatsApp...");
  });
}

// ==================== Other Existing Functions ====================
// (merged from original main.js, adapted to remove duplicate scroll handlers and alerts)

async function getMembershipData() {
  if (window.__FORCE_GYM_MEMBERSHIP__) return window.__FORCE_GYM_MEMBERSHIP__;
  const tryUrls = ["data/membership.json", "data/membership.json.txt"];
  for (const url of tryUrls) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) continue;
      return await resp.json();
    } catch (e) { /* ignore */ }
  }
  return null;
}

function formatDuration(duration, fallbackName, lang) {
  if (fallbackName) return fallbackName;
  if (!duration) return "";
  if (duration.days) return lang === "ar" ? `${duration.days} يوم` : `${duration.days} Days`;
  if (duration.months) {
    if (lang === "ar") return `${duration.months} شهر`;
    return duration.months === 1 ? "1 Month" : `${duration.months} Months`;
  }
  if (duration.years) {
    if (lang === "ar") return `${duration.years} سنة`;
    return duration.years === 1 ? "1 Year" : `${duration.years} Years`;
  }
  return "";
}

function buildBenefitsListFromObject(benefits, content, lang) {
  if (!benefits) return [];
  const list = [];
  if (benefits.guests) list.push(`${benefits.guests} ${content.membership.guestInvitations}`);
  if (benefits.ptSessions) list.push(`${benefits.ptSessions} ${content.membership.ptSession}`);
  if (benefits.freezeDays) list.push(`${content.membership.freeze}: ${benefits.freezeDays} ${lang === "ar" ? "يوم" : "days"}`);
  if (benefits.freezeMonths) list.push(`${content.membership.freeze}: ${benefits.freezeMonths} ${lang === "ar" ? "شهر" : (benefits.freezeMonths === 1 ? "month" : "months")}`);
  if (benefits.upgradeDays) list.push(`${content.membership.upgrade}: ${benefits.upgradeDays} ${lang === "ar" ? "يوم" : "days"}`);
  return list;
}

function normalizeMembershipPlans(data) {
  if (data && Array.isArray(data.plans) && data.plans.length && data.plans[0].duration) return { schema: "A", data };
  if (data && Array.isArray(data.plans) && data.plans.length && data.plans[0].name) return { schema: "B", data };
  return { schema: "none", data: null };
}

async function renderMembershipIfNeeded() {
  const page = (window.location.pathname.split("/").pop() || "").toLowerCase();
  if (page !== "membership.html") return;

  const content = I18nModule.getContent();
  if (!content) return;

  const lang = I18nModule.currentLang();
  const raw = await getMembershipData();
  const { schema, data } = normalizeMembershipPlans(raw);
  if (!data) return;

  const plans = data.plans || [];
  const pricingGrid = document.getElementById("pricing-grid");
  const benefitsGrid = document.getElementById("benefits-grid");
  const planSelect = document.getElementById("req-plan");

  const normalizedForForm = [];

  if (pricingGrid) {
    pricingGrid.innerHTML = plans
      .map((p, idx) => {
        if (schema === "A") {
          const title = formatDuration(p.duration, null, lang);
          const now = p.pricing?.now ?? "";
          const was = p.pricing?.was ?? "";
          const bList = buildBenefitsListFromObject(p.benefits, content, lang);
          const summary = bList.length ? bList.slice(0, 3).join(" · ") : (content.cta?.details || "Contact for details");
          normalizedForForm.push({ name: title, now });

          return `
            <div class="pricing-card card">
              <span class="badge">${content.membership.badge}</span>
              <h3>${title}</h3>
              <div class="price">
                <span class="now">${content.membership.now}: <strong>${now}</strong> ${content.membership.egp}</span>
                <span class="was">${content.membership.insteadOf}: <s>${was}</s> ${content.membership.egp}</span>
              </div>
              <p class="benefits-summary">${summary}</p>
            </div>`;
        }

        const title = p.name || "";
        const now = p.now ?? "";
        const was = p.was ?? "";
        const summary = Array.isArray(p.benefits) && p.benefits.length
          ? p.benefits.slice(0, 3).join(" · ")
          : (content.cta?.details || "Contact for details");

        normalizedForForm.push({ name: title, now });

        return `
          <div class="pricing-card card">
            <span class="badge">${content.membership.badge}</span>
            <h3>${title}</h3>
            <div class="price">
              <span class="now">${content.membership.now}: <strong>${now}</strong> ${content.membership.egp}</span>
              <span class="was">${content.membership.insteadOf}: <s>${was}</s> ${content.membership.egp}</span>
            </div>
            <p class="benefits-summary">${summary}</p>
          </div>`;
      })
      .join("");
    window.membershipPlans = normalizedForForm;
  }

  if (benefitsGrid) {
    benefitsGrid.innerHTML = plans
      .map((p) => {
        if (schema === "A") {
          const title = formatDuration(p.duration, null, lang);
          const bList = buildBenefitsListFromObject(p.benefits, content, lang);
          const listHtml = bList.length
            ? `<ul class="benefits-list">${bList.map((x) => `<li>${x}</li>`).join("")}</ul>`
            : `<p class="muted">${content.cta?.details || "Contact for details"}</p>`;
          return `<div class="benefit-card card"><h3>${title}</h3>${listHtml}</div>`;
        }

        const title = p.name || "";
        const b = Array.isArray(p.benefits) ? p.benefits : [];
        const listHtml = b.length
          ? `<ul class="benefits-list">${b.map((x) => `<li>${x}</li>`).join("")}</ul>`
          : `<p class="muted">${content.cta?.details || "Contact for details"}</p>`;
        return `<div class="benefit-card card"><h3>${title}</h3>${listHtml}</div>`;
      })
      .join("");
  }

  if (planSelect) {
    planSelect.innerHTML =
      '<option value="">-- Select --</option>' +
      normalizedForForm
        .map((p, idx) => `<option value="${idx}">${p.name} - ${p.now} ${content.membership.egp}</option>`)
        .join("");
  }
}

function updateUI() {
  const content = I18nModule.getContent();
  if (!content) return;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = key.split(".").reduce((obj, k) => obj && obj[k], content);
    if (value) el.textContent = value;
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    const key = el.getAttribute("data-i18n-alt");
    const value = key.split(".").reduce((obj, k) => obj && obj[k], content);
    if (value) el.alt = value;
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    const value = key.split(".").reduce((obj, k) => obj && obj[k], content);
    if (value) el.setAttribute("aria-label", value);
  });

  const seo = content.seo || {};
  document.title = seo.title || content.siteName || "Force Gym";
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", seo.description || "");

  const yearSpan = document.getElementById("current-year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  const langToggleLabel = document.getElementById("lang-toggle-label");
  if (langToggleLabel) {
    langToggleLabel.textContent = I18nModule.currentLang() === "en" ? "عربي" : "EN";
  }

  const flags = content.flags || {};
  document.querySelectorAll("[data-flag]").forEach((el) => {
    const flagName = el.getAttribute("data-flag");
    if (flags && flagName && !flags[flagName]) el.style.display = "none";
  });

  const phone = content.phone;
  const phoneFormatted = content.phoneFormatted || phone;
  const phone2 = content.phone2;
  const phone2Formatted = content.phone2Formatted || phone2;

  const copyButtons = ["copy-phone", "copy-address", "copy-phone-contact", "copy-address-contact", "copy-phone2"];
  copyButtons.forEach((id) => {
    const btn = document.getElementById(id);
    if (!btn) return;

    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener("click", () => {
      if (id.includes("phone2")) {
        navigator.clipboard.writeText(phone2Formatted).then(() => showToast(content.cta?.copied || "Copied!"));
      } else if (id.includes("phone")) {
        navigator.clipboard.writeText(phoneFormatted).then(() => showToast(content.cta?.copied || "Copied!"));
      } else if (id.includes("address")) {
        navigator.clipboard.writeText(content.address).then(() => showToast(content.cta?.copied || "Copied!"));
      }
    });
  });
}

function initLanguageToggle() {
  document.addEventListener("click", (e) => {
    const btn = e.target && e.target.closest && e.target.closest("#language-toggle");
    if (!btn) return;
    const newLang = I18nModule.currentLang() === "en" ? "ar" : "en";
    I18nModule.setLang(newLang);
  });
}

function setActiveNav() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".navbar-menu a");
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPath) link.classList.add("nav-active");
    else link.classList.remove("nav-active");
  });
}

function initHeroVideo() {
  const video = document.querySelector(".hero-video");
  const fallback = document.querySelector(".hero-fallback");
  if (!video) return;

  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    (navigator.connection && navigator.connection.saveData)
  ) {
    video.style.display = "none";
    if (fallback) fallback.style.display = "block";
    return;
  }

  video.play().catch(() => {
    video.style.display = "none";
    if (fallback) fallback.style.display = "block";
  });
}

function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  if (!sections.length) return;

  const navLinks = document.querySelectorAll('.navbar-menu a[href^="#"]');
  if (!navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('nav-active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('nav-active');
          }
        });
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(section => observer.observe(section));
}

async function renderScheduleIfNeeded() {
  const container = document.getElementById('schedule-display');
  if (!container) return;

  const lang = I18nModule.currentLang();
  const content = I18nModule.getContent() || {};
  const schedule = await DataModule.getSchedule();

  if (!schedule || schedule.length === 0) {
    const phone = content.phone || '201112622236';
    const message = encodeURIComponent(content.schedule?.whatsappMessage || 'Hi, I want to know the schedule.');
    const whatsappLink = `https://wa.me/${phone}?text=${message}`;
    container.innerHTML = `
      <div class="schedule-placeholder">
        <p>${content.schedule?.comingSoon || 'Schedule will be updated soon.'}</p>
        <a href="${whatsappLink}" class="btn btn-primary" target="_blank">${content.cta?.contact || 'Contact us on WhatsApp'}</a>
      </div>
    `;
    return;
  }

  const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const grouped = {};
  schedule.forEach(item => {
    const day = item.day?.toLowerCase();
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(item);
  });

  const sortedDays = daysOrder.filter(day => grouped[day]);

  let html = '<table class="schedule-table"><thead><tr><th>Day</th><th>Time</th><th>Class</th><th>Coach</th></tr></thead><tbody>';
  sortedDays.forEach(day => {
    const dayName = content.schedule?.days?.[day] || day;
    grouped[day].forEach((item, idx) => {
      html += '<tr>';
      if (idx === 0) html += `<td rowspan="${grouped[day].length}" data-label="Day">${dayName}</td>`;
      html += `<td data-label="Time">${item.time || ''}</td>`;
      html += `<td data-label="Class">${item.name || ''}</td>`;
      html += `<td data-label="Coach">${item.instructor || ''}</td>`;
      html += '</tr>';
    });
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

function initSmoothScroll() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.documentElement.style.scrollBehavior = 'auto';
    return;
  }

  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      if (!target) return;

      const navbar = document.querySelector('.navbar');
      const navHeight = navbar ? navbar.offsetHeight : 70;
      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      const offset = targetTop - navHeight - 8;

      window.scrollTo({
        top: offset,
        behavior: 'smooth'
      });

      history.pushState(null, null, targetId);
    });
  });
}

// ==================== Enhanced Init ====================
(async function init() {
  await ComponentsModule.injectPartials();

  ComponentsModule.initMobileMenu();

  const currentLang = I18nModule.currentLang();
  await I18nModule.loadContent(currentLang);

  initLanguageToggle();
  updateUI();
  setActiveNav();
  await renderMembershipIfNeeded();
  initHeroVideo();

  // Form handlers (no alerts)
  initMembershipForm();
  initContactForm();

  // Features that rely on scroll (but we'll use unified scroll)
  initBackToTop();
  injectScrollProgress();
  initScrollSpy();
  await renderScheduleIfNeeded();

  // Scroll reveal
  ComponentsModule.initReveal();

  // Unified scroll listener (only one)
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial update

  // Theme toggle
  initThemeToggle();

  // Smooth scroll for anchor links
  initSmoothScroll();

  // Page transitions
  initPageTransitions();

  I18nModule.subscribe(async (newLang) => {
    await I18nModule.loadContent(newLang);
    updateUI();
    setActiveNav();
    await renderMembershipIfNeeded();
    await renderScheduleIfNeeded();
    ComponentsModule.initReveal();
  });
})();