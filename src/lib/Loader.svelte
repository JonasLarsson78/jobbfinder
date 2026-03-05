<script>
  export let size = 32;
  export let text = 'Loading...';
</script>

<div class="loader">
  <div class="loader-spinner" style="--size:{size}px" aria-hidden="true"></div>
  <div class="loader-text">{text}</div>
</div>

<style lang="scss" scoped>
  .loader {
    display: flex;
    align-items: center;

    &-spinner {
      width: var(--size);
      height: var(--size);
      border: 3px solid rgba(148, 163, 184, 0.25);
      border-top-color: var(--color-primary-strong);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    &-text {
      margin-left: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-muted);
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  }
</style>
