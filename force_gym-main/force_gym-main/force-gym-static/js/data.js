// data.js
const DataModule = (function() {
  let contentCache = {};
  let scheduleCache = null;

  async function loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}`);
    return await response.json();
  }

  async function getContent(lang) {
    if (contentCache[lang]) return contentCache[lang];
    try {
      const data = await loadJSON(`data/site.${lang}.json`);
      contentCache[lang] = data;
      return data;
    } catch (e) {
      console.error(e);
      if (lang !== 'en') return getContent('en');
      return null;
    }
  }

  async function getSchedule() {
    if (scheduleCache) return scheduleCache;
    try {
      const data = await loadJSON('data/schedule.json');
      scheduleCache = data;
      return data;
    } catch (e) {
      console.error(e);
      scheduleCache = [];
      return [];
    }
  }

  return {
    getContent,
    getSchedule
  };
})();