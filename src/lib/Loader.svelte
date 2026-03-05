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
      border: 4px solid rgba(204, 204, 204, 0.1);
      border-top-color: #b3b3b3;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    &-text {
      margin-left: 10px;
      font-size: 20px;
      font-weight: bold;
      color: #b3b3b3;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  }
</style>
