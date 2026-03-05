import { writable } from 'svelte/store';

const createJobs = () => {
  const { subscribe, set, update } = writable([]);

  const transformApiData = (data) => {
    if (!data) return [];

    // Normalize to an array of "query"-like objects.
    let queries = [];

    if (Array.isArray(data.queries)) {
      queries = data.queries;
    } else if (Array.isArray(data)) {
      queries = data;
    } else if (
      data.city ||
      data.result ||
      data.afMatches ||
      data.linkedinMatches
    ) {
      // Single-city response (e.g. when filtering) — wrap into array
      queries = [data];
    } else {
      return [];
    }

    return queries
      .map((q) => {
        const city = q.city || '';

        // Support both shapes: q.result.afMatches OR q.afMatches
        const af =
          q.result && Array.isArray(q.result.afMatches)
            ? q.result.afMatches
            : Array.isArray(q.afMatches)
              ? q.afMatches
              : [];

        const linkedin =
          q.result && Array.isArray(q.result.linkedinMatches)
            ? q.result.linkedinMatches
            : Array.isArray(q.linkedinMatches)
              ? q.linkedinMatches
              : [];

        return { city, af, linkedin };
      })
      .filter(
        (entry) =>
          (Array.isArray(entry.af) && entry.af.length > 0) ||
          (Array.isArray(entry.linkedin) && entry.linkedin.length > 0)
      );
  };

  return {
    subscribe,
    set,
    update,
    loadFromApi(apiData) {
      set(transformApiData(apiData));
    },
    addCityEntry(entry) {
      update((list) => [...list, entry]);
    },
    clear() {
      set([]);
    },
  };
};

export const jobs = createJobs();
