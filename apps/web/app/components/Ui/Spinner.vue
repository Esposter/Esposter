<script setup lang="ts">
import { SPINNER_FRAMES, SPINNER_INTERVAL_MS } from "@/services/ui/constants";
import { takeOne } from "@esposter/shared";

const uiStyle = useUiStyle();
const reducedMotion = usePreferredReducedMotion();
const frameIndex = ref(0);
// Asked for reduced motion, the star holds still
useIntervalFn(() => {
  if (reducedMotion.value === "reduce") return;
  frameIndex.value = (frameIndex.value + 1) % SPINNER_FRAMES.length;
}, SPINNER_INTERVAL_MS);
</script>

<template>
  <span class="spinner" :data-ui-style="uiStyle" aria-hidden="true" text-accent text-center w-1ch inline-block>
    {{ takeOne(SPINNER_FRAMES, frameIndex) }}
  </span>
</template>

<style scoped>
/* Standard turns a ring in the accent over the same element, its frames still there to read and never seen */
.spinner[data-ui-style="standard"] {
  animation: turn calc(var(--ui-motion-unit) * 14) linear infinite;
  border: calc(var(--ui-step) / 2) solid color-mix(in srgb, var(--ui-accent) 25%, transparent);
  border-radius: 50%;
  border-top-color: var(--ui-accent);
  color: transparent;
  height: 1ch;
}

@keyframes turn {
  to {
    rotate: 1turn;
  }
}
</style>
