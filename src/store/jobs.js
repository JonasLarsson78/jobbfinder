import { writable } from 'svelte/store';

const STORAGE_KEY = 'jobbfinder:jobs';

const loadInitialJobs = () => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persistJobs = (value) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore write errors
  }
};

const createJobs = () => {
  const { subscribe, set, update } = writable(loadInitialJobs());

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

        // Lägg till applied:false och ignored:false på varje jobb
        const afWithFlags = af.map((job) => ({
          ...job,
          applied: false,
          ignored: false,
        }));
        const linkedinWithFlags = linkedin.map((job) => ({
          ...job,
          applied: false,
          ignored: false,
        }));
        return { city, af: afWithFlags, linkedin: linkedinWithFlags };
      })
      .filter(
        (entry) =>
          (Array.isArray(entry.af) && entry.af.length > 0) ||
          (Array.isArray(entry.linkedin) && entry.linkedin.length > 0)
      );
  };

  return {
    markAsIgnored(type, city, jobId) {
      update((list) => {
        const next = list.map((entry) => {
          if (entry.city !== city) return entry;
          const updated = { ...entry };
          if (type === 'af') {
            updated.af = entry.af.map((job) =>
              job.id === jobId ? { ...job, ignored: true } : job
            );
          } else if (type === 'linkedin') {
            updated.linkedin = entry.linkedin.map((job) =>
              job.id === jobId ? { ...job, ignored: true } : job
            );
          }
          return updated;
        });
        persistJobs(next);
        return next;
      });
    },

    undoIgnored(type, city, jobId) {
      update((list) => {
        const next = list.map((entry) => {
          if (entry.city !== city) return entry;
          const updated = { ...entry };
          if (type === 'af') {
            updated.af = entry.af.map((job) =>
              job.id === jobId ? { ...job, ignored: false } : job
            );
          } else if (type === 'linkedin') {
            updated.linkedin = entry.linkedin.map((job) =>
              job.id === jobId ? { ...job, ignored: false } : job
            );
          }
          return updated;
        });
        persistJobs(next);
        return next;
      });
    },
    markAsApplied(type, city, jobId) {
      // type: 'af' eller 'linkedin', city: string, jobId: id på jobbet
      update((list) => {
        const next = list.map((entry) => {
          if (entry.city !== city) return entry;
          const updated = { ...entry };
          if (type === 'af') {
            updated.af = entry.af.map((job) =>
              job.id === jobId ? { ...job, applied: true } : job
            );
          } else if (type === 'linkedin') {
            updated.linkedin = entry.linkedin.map((job) =>
              job.id === jobId ? { ...job, applied: true } : job
            );
          }
          return updated;
        });
        persistJobs(next);
        return next;
      });
    },

    undoApplied(type, city, jobId) {
      update((list) => {
        const next = list.map((entry) => {
          if (entry.city !== city) return entry;
          const updated = { ...entry };
          if (type === 'af') {
            updated.af = entry.af.map((job) =>
              job.id === jobId ? { ...job, applied: false } : job
            );
          } else if (type === 'linkedin') {
            updated.linkedin = entry.linkedin.map((job) =>
              job.id === jobId ? { ...job, applied: false } : job
            );
          }
          return updated;
        });
        persistJobs(next);
        return next;
      });
    },
    subscribe,
    set,
    update,
    loadFromApi(apiData) {
      const transformed = transformApiData(apiData);
      set(transformed);
      persistJobs(transformed);
    },
    addCityEntry(entry) {
      update((list) => {
        const next = [...list, entry];
        persistJobs(next);
        return next;
      });
    },
    clear() {
      set([]);
      persistJobs([]);
    },
  };
};

export const jobs = createJobs();
