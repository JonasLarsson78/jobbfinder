<script>
  import { jobs } from '../store/jobs.js';
  import Filter from './Filter.svelte';
</script>

<Filter />

{#if $jobs.length === 0}
  <div style="margin-top:12px">
    <hr />
    <i>Inga jobb att visa — använd sökrutan ovan eller klicka Sök.</i>
  </div>
{:else}
  {#each $jobs as entry}
    <hr />
    <h3>{entry.city}</h3>

    {#if entry.af && entry.af.length}
      {#each entry.af as a}
        <div class="af">
          <b>AF -</b>
          <h2>
            <a href={a.webpage_url} target="_blank" rel="noopener noreferrer"
              >{a.headline}</a
            >
          </h2>
          {#if a.employer}
            <div class="text"><b>Arbetsgivare:</b> {a.employer}</div>
          {/if}
          {#if a.application_deadline}
            <div class="text">
              <b>Sista ansökningsdag:</b>
              {a.application_deadline}
            </div>
          {/if}
          {#if a.number_of_vacancies}
            <div class="text">
              <b>Antal lediga platser:</b>
              {a.number_of_vacancies}
            </div>
          {/if}
          {#if a.conditions}
            <div class="text"><b>Villkor:</b> {a.conditions}</div>
          {/if}
        </div>
      {/each}
    {/if}

    {#if entry.linkedin && entry.linkedin.length}
      {#each entry.linkedin as l}
        <div class="li">
          <b>LI -</b>
          <h2>
            <a href={l.url} target="_blank" rel="noopener noreferrer"
              >{l.title}</a
            >
          </h2>
          <div class="text"><b>Företag:</b> {l.company}</div>
          {#if l.location}
            <div class="text"><b>Plats:</b> {l.location}</div>
          {/if}
          {#if l.datetime}
            <div class="text"><b>Publicerad:</b> {l.datetime}</div>
          {/if}
        </div>
      {/each}
    {/if}
  {/each}

  <br />
  <div class="info"><i>AF = Arbetsförmedlingen</i></div>
  <div class="info"><i>LI = LinkedIn</i></div>
{/if}

<style lang="scss" scoped>
  h2 {
    font-size: 18px;
    margin: 0;
    display: inline-block;
    white-space: nowrap;
  }

  .info {
    font-size: 13px;
    color: #e4e4e4;
  }

  .af {
    margin-bottom: 16px;
  }

  .li {
    margin-bottom: 12px;
  }

  .text {
    font-size: 14px;
    margin-left: 36px;
    max-width: 50%;
  }
</style>
