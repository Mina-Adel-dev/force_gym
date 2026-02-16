// i18n.js
const I18nModule = (function() {
  let currentLang = localStorage.getItem('force-gym-lang') || 'en';
  let content = null;
  let subscribers = [];

  function setLang(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem('force-gym-lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    subscribers.forEach(cb => cb(lang));
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

  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';

  return {
    currentLang: () => currentLang,
    setLang,
    loadContent,
    getContent,
    subscribe
  };
})();