<script>
  import AfList from './lib/AfList.svelte';
</script>

<main>
  <header class="app-header">
    <div class="title-block">
      <h2>Jobb Finder</h2>
      <span class="subtitle"
        >En ren överblick över annonser från Arbetsförmedlingen och LinkedIn</span
      >
    </div>
    <div class="meta">
      <span>Senast uppdaterad: automatiskt vid sökning</span>
    </div>
  </header>
  <section class="content">
    <AfList />
  </section>
</main>

<style lang="scss">
  .app-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-end;
    gap: 8px 16px;
    margin-bottom: 4px;
  }

  .title-block {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }

  .subtitle {
    font-size: 13px;
    color: var(--color-text-muted);
  }

  .meta {
    font-size: 12px;
    color: var(--color-text-soft);
  }

  .content {
    margin-top: 8px;
  }
</style>
