<script>
  import { jobs } from '../store/jobs.js';
  import Filter from './Filter.svelte';

  let lastHitCount = null;
  let lastGroupCount = null;

  // Håll sammanfattningen i synk med jobbdatan (även efter reload)
  $: {
    const list = $jobs || [];
    if (!list.length) {
      lastHitCount = null;
      lastGroupCount = null;
    } else {
      let hits = 0;
      let groups = 0;
      for (const entry of list) {
        // Räkna ENDAST ej sökta och ej ignorerade
        const afCount = Array.isArray(entry.af)
          ? entry.af.filter((a) => !a.applied && !a.ignored).length
          : 0;
        const liCount = Array.isArray(entry.linkedin)
          ? entry.linkedin.filter((l) => !l.applied && !l.ignored).length
          : 0;
        const totalForCity = afCount + liCount;
        if (totalForCity > 0) {
          groups += 1;
          hits += totalForCity;
        }
      }
      lastHitCount = hits;
      lastGroupCount = groups;
    }
  }
</script>

<Filter />

{#if lastHitCount !== null}
  <div class="result-summary">
    {#if lastHitCount === 0}
      Inga sökträffar hittades.
    {:else}
      <strong>{lastHitCount}</strong>
      sökträffar
      {#if lastGroupCount !== null && lastGroupCount > 0}
        i <strong>{lastGroupCount}</strong>
        stad(er)
      {/if}
    {/if}
  </div>
{/if}

{#if $jobs.length === 0}
  <div class="empty-state">
    <h3>Inga jobb att visa ännu</h3>
    <p>
      Använd sökpanelen ovan och klicka på <b>Sök</b> för att hämta aktuella annonser.
    </p>
  </div>
{:else}
  <!-- Ej sökta jobb -->
  <h4>Ej sökta jobb</h4>
  {#each $jobs.filter((entry) => {
    // entry._fromSearch är satt på nya sökresultat, annars undefined
    // Om _fromSearch inte finns, visa inte i ej sökta-listan
    if (!entry._fromSearch) return false;
    const afActive = entry.af ? entry.af.some((a) => !a.applied && !a.ignored) : false;
    const liActive = entry.linkedin ? entry.linkedin.some((l) => !l.applied && !l.ignored) : false;
    return afActive || liActive;
  }) as entry (entry.city)}
    <hr />
    <section class="city-block">
      <div class="city-header">
        <h3>{entry.city}</h3>
        <div class="source-badges">
          {#if entry.af && entry.af.length}
            <span class="badge af-badge">AF</span>
          {/if}
          {#if entry.linkedin && entry.linkedin.length}
            <span class="badge li-badge">LI</span>
          {/if}
        </div>
      </div>

      {#if entry.af && entry.af.length}
        {#each entry.af.filter((a) => !a.applied && !a.ignored) as a (a.id)}
          <article class="job-card af">
            <header class="job-header">
              <span class="source-pill af-pill">Arbetsförmedlingen</span>
              <h2>
                <a
                  href={a.webpage_url}
                  target="_blank"
                  rel="noopener noreferrer">{a.headline}</a
                >
              </h2>
            </header>
            <div class="meta-grid">
              {#if a.employer}
                <div class="meta-item">
                  <span>Arbetsgivare</span><strong>{a.employer}</strong>
                </div>
              {/if}
              {#if a.application_deadline}
                <div class="meta-item">
                  <span>Sista ansökningsdag</span>
                  <strong>{a.application_deadline}</strong>
                </div>
              {/if}
              {#if a.number_of_vacancies}
                <div class="meta-item">
                  <span>Antal lediga platser</span>
                  <strong>{a.number_of_vacancies}</strong>
                </div>
              {/if}
              {#if a.conditions}
                <div class="meta-item full-width">
                  <span>Villkor</span>
                  <strong>{a.conditions}</strong>
                </div>
              {/if}
            </div>
            <button on:click={() => jobs.markAsApplied('af', entry.city, a.id)}>
              Markera som sökt
            </button>
            <button on:click={() => jobs.markAsIgnored('af', entry.city, a.id)}>
              Ignorera
            </button>
          </article>
        {/each}
      {/if}

      {#if entry.linkedin && entry.linkedin.length}
        {#each entry.linkedin.filter((l) => !l.applied && !l.ignored) as l (l.id)}
          <article class="job-card li">
            <header class="job-header">
              <span class="source-pill li-pill">LinkedIn</span>
              <h2>
                <a href={l.url} target="_blank" rel="noopener noreferrer"
                  >{l.title}</a
                >
              </h2>
            </header>
            <div class="meta-grid">
              <div class="meta-item">
                <span>Företag</span><strong>{l.company}</strong>
              </div>
              {#if l.location}
                <div class="meta-item">
                  <span>Plats</span><strong>{l.location}</strong>
                </div>
              {/if}
              {#if l.datetime}
                <div class="meta-item">
                  <span>Publicerad</span><strong>{l.datetime}</strong>
                </div>
              {/if}
            </div>
            <button
              on:click={() => jobs.markAsApplied('linkedin', entry.city, l.id)}
            >
              Markera som sökt
            </button>
            <button
              on:click={() => jobs.markAsIgnored('linkedin', entry.city, l.id)}
            >
              Ignorera
            </button>
          </article>
        {/each}
      {/if}
    </section>
  {/each}

  {#if $jobs.some((e) => (e.af && e.af.some((a) => a.ignored)) || (e.linkedin && e.linkedin.some((l) => l.ignored)) || (e.af && e.af.some((a) => a.applied)) || (e.linkedin && e.linkedin.some((l) => l.applied)))}
    <hr style="border-color: black; border-width: 2px;" />
  {/if}

  {#if $jobs.some((e) => (e.af && e.af.some((a) => a.ignored)) || (e.linkedin && e.linkedin.some((l) => l.ignored)))}
    <h4 style="color: #f59e42;">Ignorerade</h4>
    {#each $jobs.filter((e) => (e.af && e.af.some((a) => a.ignored)) || (e.linkedin && e.linkedin.some((l) => l.ignored))) as entry (entry.city)}
      <section class="city-block">
        <div class="city-header">
          <h3>{entry.city}</h3>
        </div>
        {#if entry.af && entry.af.length}
          {#each entry.af.filter((a) => a.ignored) as a (a.id)}
            <article class="job-card af ignored">
              <header class="job-header">
                <span class="source-pill af-pill">Arbetsförmedlingen</span>
                <h2>
                  <a
                    href={a.webpage_url}
                    target="_blank"
                    rel="noopener noreferrer">{a.headline}</a
                  >
                </h2>
              </header>
              <div class="meta-grid">
                {#if a.employer}
                  <div class="meta-item">
                    <span>Arbetsgivare</span><strong>{a.employer}</strong>
                  </div>
                {/if}
                {#if a.application_deadline}
                  <div class="meta-item">
                    <span>Sista ansökningsdag</span>
                    <strong>{a.application_deadline}</strong>
                  </div>
                {/if}
                {#if a.number_of_vacancies}
                  <div class="meta-item">
                    <span>Antal lediga platser</span>
                    <strong>{a.number_of_vacancies}</strong>
                  </div>
                {/if}
                {#if a.conditions}
                  <div class="meta-item full-width">
                    <span>Villkor</span>
                    <strong>{a.conditions}</strong>
                  </div>
                {/if}
              </div>
              <span class="applied-label">Ignorerad</span>
              <button on:click={() => jobs.undoIgnored('af', entry.city, a.id)}>
                Ångra
              </button>
            </article>
          {/each}
        {/if}
        {#if entry.linkedin && entry.linkedin.length}
          {#each entry.linkedin.filter((l) => l.ignored) as l (l.id)}
            <article class="job-card li ignored">
              <header class="job-header">
                <span class="source-pill li-pill">LinkedIn</span>
                <h2>
                  <a href={l.url} target="_blank" rel="noopener noreferrer"
                    >{l.title}</a
                  >
                </h2>
              </header>
              <div class="meta-grid">
                <div class="meta-item">
                  <span>Företag</span><strong>{l.company}</strong>
                </div>
                {#if l.location}
                  <div class="meta-item">
                    <span>Plats</span><strong>{l.location}</strong>
                  </div>
                {/if}
                {#if l.datetime}
                  <div class="meta-item">
                    <span>Publicerad</span><strong>{l.datetime}</strong>
                  </div>
                {/if}
              </div>
              <span class="applied-label">Ignorerad</span>
              <button
                on:click={() => jobs.undoIgnored('linkedin', entry.city, l.id)}
              >
                Ångra
              </button>
            </article>
          {/each}
        {/if}
      </section>
    {/each}
  {/if}

  {#if $jobs.some((e) => (e.af && e.af.some((a) => a.applied)) || (e.linkedin && e.linkedin.some((l) => l.applied)))}
    <h4 style="color: #10b981;">Sökt</h4>
    {#each $jobs.filter((e) => (e.af && e.af.some((a) => a.applied)) || (e.linkedin && e.linkedin.some((l) => l.applied))) as entry (entry.city)}
      <section class="city-block">
        <div class="city-header">
          <h3>{entry.city}</h3>
        </div>
        {#if entry.af && entry.af.length}
          {#each entry.af.filter((a) => a.applied) as a (a.id)}
            <article class="job-card af applied-final">
              <header class="job-header">
                <span class="source-pill af-pill">Arbetsförmedlingen</span>
                <h2>
                  <a
                    href={a.webpage_url}
                    target="_blank"
                    rel="noopener noreferrer">{a.headline}</a
                  >
                </h2>
              </header>
              <div class="meta-grid">
                {#if a.employer}
                  <div class="meta-item">
                    <span>Arbetsgivare</span><strong>{a.employer}</strong>
                  </div>
                {/if}
                {#if a.application_deadline}
                  <div class="meta-item">
                    <span>Sista ansökningsdag</span>
                    <strong>{a.application_deadline}</strong>
                  </div>
                {/if}
                {#if a.number_of_vacancies}
                  <div class="meta-item">
                    <span>Antal lediga platser</span>
                    <strong>{a.number_of_vacancies}</strong>
                  </div>
                {/if}
                {#if a.conditions}
                  <div class="meta-item full-width">
                    <span>Villkor</span>
                    <strong>{a.conditions}</strong>
                  </div>
                {/if}
              </div>
              <span class="applied-label">Sökt</span>
              <button on:click={() => jobs.undoApplied('af', entry.city, a.id)}>
                Ångra
              </button>
            </article>
          {/each}
        {/if}
        {#if entry.linkedin && entry.linkedin.length}
          {#each entry.linkedin.filter((l) => l.applied) as l (l.id)}
            <article class="job-card li applied-final">
              <header class="job-header">
                <span class="source-pill li-pill">LinkedIn</span>
                <h2>
                  <a href={l.url} target="_blank" rel="noopener noreferrer"
                    >{l.title}</a
                  >
                </h2>
              </header>
              <div class="meta-grid">
                <div class="meta-item">
                  <span>Företag</span><strong>{l.company}</strong>
                </div>
                {#if l.location}
                  <div class="meta-item">
                    <span>Plats</span><strong>{l.location}</strong>
                  </div>
                {/if}
                {#if l.datetime}
                  <div class="meta-item">
                    <span>Publicerad</span><strong>{l.datetime}</strong>
                  </div>
                {/if}
              </div>
              <span class="applied-label">Sökt</span>
              <button
                on:click={() => jobs.undoApplied('linkedin', entry.city, l.id)}
              >
                Ångra
              </button>
            </article>
          {/each}
        {/if}
      </section>
    {/each}
  {/if}

  <div class="legend">
    <span><span class="badge af-badge">AF</span> Arbetsförmedlingen</span>
    <span><span class="badge li-badge">LI</span> LinkedIn</span>
  </div>
{/if}

<style lang="scss" scoped>
  .empty-state {
    margin-top: 18px;
    padding: 18px 18px 16px;
    border-radius: var(--radius-md);
    border: 1px dashed var(--color-border-strong);
    background: var(--color-surface-soft);
  }

  .empty-state h3 {
    margin: 0 0 4px;
    font-size: 16px;
  }

  .empty-state p {
    margin: 0;
    font-size: 13px;
    color: var(--color-text-muted);
  }

  .result-summary {
    margin-top: 10px;
    font-size: 13px;
    color: var(--color-text-muted);
  }

  .city-block {
    margin: 12px 0 4px;
  }

  .city-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
    padding: 6px 10px;
    border-radius: 8px;
    background: linear-gradient(
      90deg,
      rgba(37, 99, 235, 0.05),
      rgba(148, 163, 184, 0)
    );
  }

  .city-header h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
  }

  .source-badges {
    display: flex;
    gap: 6px;
    font-size: 11px;
  }

  .badge {
    padding: 3px 8px;
    border-radius: 999px;
    border: 1px solid transparent;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .af-badge {
    background: var(--color-primary-soft);
    border-color: rgba(37, 99, 235, 0.25);
    color: var(--color-primary-strong);
  }

  .li-badge {
    background: #ecfdf5;
    border-color: #6ee7b7;
    color: #047857;
  }

  .job-card {
    margin: 8px 0;
    padding: 12px 14px 10px;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-subtle);
    background: #ffffff;
    box-shadow: var(--shadow-soft);
    position: relative;
    overflow: hidden;
  }

  .job-card::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 4px;
    background: linear-gradient(180deg, #2563eb, #0ea5e9);
  }

  .job-header {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 6px 10px;
    margin-bottom: 6px;
  }

  .source-pill {
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 999px;
    background: var(--color-surface-soft);
    border: 1px solid var(--color-border-subtle);
    color: var(--color-text-muted);
  }

  .af-pill {
    background: var(--color-primary-soft);
    border-color: rgba(37, 99, 235, 0.2);
    color: var(--color-primary-strong);
  }

  .li-pill {
    background: #ecfdf5;
    border-color: #6ee7b7;
    color: #047857;
  }

  .job-header h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .job-header a {
    text-decoration: none;
  }

  .job-header a:hover {
    text-decoration: underline;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 6px 16px;
    margin-top: 4px;
    font-size: 13px;
  }

  .meta-item span {
    display: block;
    color: var(--color-text-soft);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 11px;
    margin-bottom: 1px;
  }

  .meta-item strong {
    font-weight: 500;
    color: var(--color-text-main);
  }

  .meta-item.full-width {
    grid-column: 1 / -1;
  }

  .legend {
    margin-top: 16px;
    padding-top: 10px;
    border-top: 1px solid var(--color-border-subtle);
    font-size: 12px;
    color: var(--color-text-soft);
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .job-card.ignored {
    background: #fff7e6;
    border: 2px solid #f59e42;
    box-shadow: 0 2px 8px 0 #f59e4222;
    position: relative;
  }
  .job-card.ignored::after {
    content: 'Ignorerad';
    position: absolute;
    top: 10px;
    right: 18px;
    background: #f59e42;
    color: #fff;
    font-size: 11px;
    font-weight: bold;
    padding: 2px 10px;
    border-radius: 999px;
    letter-spacing: 0.04em;
    box-shadow: 0 1px 4px #f59e4244;
  }

  .job-card.applied-final {
    background: #e6f7ef;
    border: 2px solid #10b981;
    box-shadow: 0 2px 8px 0 #10b98122;
    position: relative;
  }
  .job-card.applied-final::after {
    content: 'Sökt';
    position: absolute;
    top: 10px;
    right: 18px;
    background: #10b981;
    color: #fff;
    font-size: 11px;
    font-weight: bold;
    padding: 2px 10px;
    border-radius: 999px;
    letter-spacing: 0.04em;
    box-shadow: 0 1px 4px #10b98144;
  }
</style>
