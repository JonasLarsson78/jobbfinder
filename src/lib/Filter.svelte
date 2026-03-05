<script>
  import { createEventDispatcher } from 'svelte';
  import request from '../utils/request.js';
  import { jobs } from '../store/jobs.js';
  import Loader from './Loader.svelte';

  const dispatch = createEventDispatcher();

  let city = '';
  let q = '';
  let loading = false;
  let error = '';
  const defaultCities = 'Lund,Malmö,Helsingborg';
  const defaultQ = 'frontend-utvecklare';

  async function submit(e) {
    e && e.preventDefault();
    error = '';
    loading = true;
    try {
      if (!city) city = defaultCities;
      if (!q) q = defaultQ;
      const url = `http://localhost:3000/jobs?city=${encodeURIComponent(city)}&q=${encodeURIComponent(q)}`;
      const res = await request(url);
      jobs.loadFromApi(res);

      dispatch('loaded', { count: (res?.queries || []).length });
    } catch (err) {
      error = err.message || 'Request failed';
    } finally {
      loading = false;
    }
  }
</script>

<form on:submit|preventDefault={submit} class="filter">
  <label>
    Stad(er)
    <input placeholder="Lund,Malmö,Helsingborg" bind:value={city} />
  </label>

  <label>
    Sökord
    <input placeholder="frontend-utvecklare" bind:value={q} />
  </label>

  <button type="submit" disabled={loading}> Sök </button>
  <div><i><b>Default stad(er):</b></i> {defaultCities}</div>
  <div><i><b>Default sökord:</b></i> {defaultQ}</div>
  <div class="note">
    <i>Bara tryck på "Sök" för att använda standardvärdena</i>
  </div>

  {#if loading}
    <Loader size={20} text="Läser..." />
  {/if}

  {#if error}
    <div class="error">{error}</div>
  {/if}
</form>

<style scoped>
  .filter {
    display: flex;
    gap: 12px;
    align-items: end;
    flex-wrap: wrap;
  }
  label {
    display: flex;
    flex-direction: column;
    font-size: 13px;
  }
  input {
    min-width: 300px;
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  button {
    min-width: 100px;
    padding: 8px 12px;
    background: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
  }
  .error {
    color: #c00;
    margin-left: 8px;
  }
  .note {
    flex-basis: 100%;
    white-space: normal;
  }
</style>
