/* Speicher-Helfer: alles unter dem Präfix "bennet." in localStorage */
const Storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem('bennet.' + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem('bennet.' + key, JSON.stringify(value));
    } catch (e) { /* Speicher voll o.ä. – Spiel läuft trotzdem weiter */ }
  },
  addStar(gameId) {
    const stars = Storage.get('stars', {});
    stars[gameId] = (stars[gameId] || 0) + 1;
    Storage.set('stars', stars);
    return Storage.totalStars();
  },
  totalStars() {
    const stars = Storage.get('stars', {});
    return Object.values(stars).reduce((a, b) => a + b, 0);
  }
};
