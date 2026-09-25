<!-- A block a tone off whatever it sits on, standing in for content still on its way, with a lighter band stepping across
     it a frame at a time. The block itself holds still: a whole region blinking between two shades reads as a strobe
     once it is a blade's height or a table's rows in step. Decoration only: the region it fills says it is busy -->
<script setup lang="ts">
const uiStyle = useUiStyle();
</script>

<template>
  <div class="skeleton" :data-ui-style="uiStyle" aria-hidden="true" />
</template>

<style scoped>
.skeleton {
  animation: sweep calc(var(--ui-motion-unit) * 24) steps(10) infinite;
  background: linear-gradient(
      90deg,
      transparent 40%,
      color-mix(in srgb, var(--ui-border) 60%, transparent) 40% 60%,
      transparent 60%
    )
    color-mix(in srgb, var(--ui-text) 8%, transparent);
  background-size: 250% 100%;
}

/* Standard eases its band across rather than stepping it, on the style's own radius */
.skeleton[data-ui-style="standard"] {
  animation-timing-function: var(--ui-motion-easing);
  border-radius: var(--ui-control-radius);
}

@keyframes sweep {
  from {
    background-position: 100% 0;
  }

  to {
    background-position: 0 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
  }
}
</style>
