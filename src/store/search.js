import { writable, get } from 'svelte/store';

function createPersistedStore(key, initialValue) {
  let startValue = initialValue;

  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(key);
      if (stored != null) {
        startValue = JSON.parse(stored);
      }
    } catch (e) {
      // ignore parse errors and fall back to initialValue
      startValue = initialValue;
    }
  }

  const store = writable(startValue);

  if (typeof window !== 'undefined') {
    store.subscribe((value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        // ignore write errors (e.g. storage full)
      }
    });
  }

  return store;
}

export const searchFilter = createPersistedStore('jobbfinder:search-filter', {
  city: '',
  q: '',
});
