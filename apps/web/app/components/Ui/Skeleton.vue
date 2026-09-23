<!-- A block standing in for content still on its way, stepping between two shades of the panel rather than shimmering.
     Decoration only: the region it fills says it is busy -->
<template>
  <div class="skeleton" aria-hidden="true" />
</template>

<style scoped>
.skeleton {
  animation: step 1s steps(2) infinite;
  background-color: var(--ui-panel-edge);
}

@keyframes step {
  to {
    background-color: var(--ui-background);
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
  }
}
</style>
