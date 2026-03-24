<script>
  import { createEventDispatcher } from 'svelte';
  import request from '../utils/request.js';
  import { jobs } from '../store/jobs.js';
  import Loader from './Loader.svelte';
  import { get } from 'svelte/store';
  import { searchFilter } from '../store/search.js';
  import capitalizeCommaSeparated from '../utils/capitalizeCommaSeparated.js';

  const dispatch = createEventDispatcher();

  let city = '';
  let q = '';
  let exclude = '';
  let loading = false;
  let error = '';
  const defaultCities = 'Lund,Malmö,Helsingborg';
  const defaultQ = 'frontend-utvecklare';

  // Läs in ev. sparade filtervärden från persisted store
  const initialFilter = get(searchFilter);
  if (initialFilter) {
    city = initialFilter.city || '';
    q = initialFilter.q || '';
    exclude = initialFilter.exclude || '';
  }

  // Spara filtervärden löpande så de alltid är persistenta
  $: searchFilter.set({ city, q, exclude });

  function computeResultCount(data) {
    if (!data) return { count: 0, groups: 0 };

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
      queries = [data];
    } else {
      return { count: 0, groups: 0 };
    }

    let total = 0;
    let groupsWithHits = 0;
    for (const qItem of queries) {
      const af =
        qItem.result && Array.isArray(qItem.result.afMatches)
          ? qItem.result.afMatches
          : Array.isArray(qItem.afMatches)
            ? qItem.afMatches
            : [];

      const linkedin =
        qItem.result && Array.isArray(qItem.result.linkedinMatches)
          ? qItem.result.linkedinMatches
          : Array.isArray(qItem.linkedinMatches)
            ? qItem.linkedinMatches
            : [];

      const countForCity = (af?.length || 0) + (linkedin?.length || 0);
      total += countForCity;
      if (countForCity > 0) {
        groupsWithHits += 1;
      }
    }

    return { count: total, groups: groupsWithHits };
  }

  async function submit(e) {
    e && e.preventDefault();
    error = '';
    loading = true;
    try {
      if (!city) city = defaultCities;
      city = capitalizeCommaSeparated(city);

      if (!q) q = defaultQ;
      // normalize exclude (comma-separated values)
      exclude = exclude || '';
      exclude = capitalizeCommaSeparated(exclude);
      const url = `https://jobbfinder-api.vercel.app/jobs?city=${encodeURIComponent(city)}&q=${encodeURIComponent(q)}&exclude=${encodeURIComponent(exclude)}`;
      const res = await request(url);
      const { count, groups } = computeResultCount(res);
      jobs.loadFromApi(res);

      dispatch('loaded', { count, groups });
    } catch (err) {
      error = err.message || 'Request failed';
    } finally {
      loading = false;
    }
  }
</script>

<form on:submit|preventDefault={submit} class="filter">
  <fieldset class="filter-card">
    <legend>Sök jobb</legend>

    <div class="filter-row">
      <label>
        <span class="label-text">Stad(er)</span>
        <input
          placeholder="Lund,Malmö,Helsingborg"
          bind:value={city}
          aria-label="Stad eller städer"
        />
      </label>

      <label>
        <span class="label-text">Sökord</span>
        <input
          placeholder="frontend-utvecklare"
          bind:value={q}
          aria-label="Sökord"
        />
      </label>

      <label>
        <span class="label-text">Exkludera</span>
        <input
          placeholder="företag1,företag2 eller ord att exkludera"
          bind:value={exclude}
          aria-label="Exkludera"
        />
      </label>

      <button type="submit" disabled={loading}>
        {#if loading}
          Söker...
        {:else}
          Sök
        {/if}
      </button>
    </div>

    <div class="helper-text">
      <span>
        <b>Standardstad(er):</b>
        {defaultCities}
      </span>
      <span>
        <b>Standardsökord:</b>
        {defaultQ}
      </span>
      <span class="hint"
        >Lämna fälten tomma och tryck på "Sök" för att använda standardvärdena.</span
      >
    </div>

    {#if loading}
      <div class="loader-row">
        <Loader size={18} text="Hämtar annonser" />
      </div>
    {/if}

    {#if error}
      <div class="error" role="alert">{error}</div>
    {/if}
  </fieldset>
</form>

<style scoped>
  .filter {
    margin-top: 8px;
  }

  .filter-card {
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-md);
    padding: 16px 16px 14px;
    margin: 0;
    background: #ffffff;
    box-shadow: var(--shadow-soft);
    position: relative;
    overflow: hidden;
  }

  .filter-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #2563eb, #0ea5e9);
  }

  .filter-card legend {
    padding: 0 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-main);
    background: #ffffff;
  }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    align-items: flex-end;
    padding: 10px 10px 8px;
    margin: 10px -6px 0;
    border-radius: 8px;
    background: linear-gradient(
      135deg,
      rgba(37, 99, 235, 0.04),
      rgba(148, 163, 184, 0.03)
    );
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: var(--color-text-main);
  }

  .label-text {
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  input {
    min-width: 260px;
    padding: 7px 9px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border-strong);
    font-size: 14px;
    color: var(--color-text-main);
    background: #ffffff;
    transition:
      border-color 120ms ease,
      box-shadow 120ms ease,
      background-color 120ms ease;
  }

  input::placeholder {
    color: var(--color-text-soft);
  }

  input:focus {
    outline: none;
    border-color: var(--color-primary-strong);
    box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.18);
    background: #ffffff;
  }

  button {
    min-width: 110px;
    padding: 9px 16px;
    border-radius: 999px;
    border: 1px solid transparent;
    font-size: 14px;
    font-weight: 500;
    background: linear-gradient(90deg, #2563eb, #1d4ed8);
    color: #ffffff;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.2);
    transition:
      background 120ms ease,
      box-shadow 120ms ease,
      transform 80ms ease,
      opacity 80ms ease;
  }

  button:hover:enabled {
    background: linear-gradient(90deg, #1d4ed8, #1d4ed8);
    box-shadow: 0 2px 4px rgba(15, 23, 42, 0.25);
    transform: translateY(-0.5px);
  }

  button:active:enabled {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.2);
  }

  button:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .helper-text {
    margin-top: 10px;
    padding: 8px 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    font-size: 12px;
    color: var(--color-text-muted);
    border-radius: 6px;
    background: rgba(148, 163, 184, 0.08);
  }

  .helper-text b {
    font-weight: 600;
  }

  .hint {
    flex-basis: 100%;
  }

  .loader-row {
    margin-top: 10px;
  }

  .error {
    margin-top: 10px;
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-danger);
    background: var(--color-danger-soft);
    color: var(--color-danger);
    font-size: 13px;
  }

  @media (max-width: 720px) {
    input {
      min-width: min(100%, 320px);
    }
  }
</style>
