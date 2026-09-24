<script setup lang="ts">
import { SPINNER_FRAMES, SPINNER_INTERVAL_MS } from "@/services/agentConsole/constants";
import { takeOne } from "@esposter/shared";

const reducedMotion = usePreferredReducedMotion();
const frameIndex = ref(0);
// Asked for reduced motion, the star holds still
useIntervalFn(() => {
  if (reducedMotion.value === "reduce") return;
  frameIndex.value = (frameIndex.value + 1) % SPINNER_FRAMES.length;
}, SPINNER_INTERVAL_MS);
</script>

<template>
  <span class="spinner" aria-hidden="true">{{ takeOne(SPINNER_FRAMES, frameIndex) }}</span>
</template>

<style scoped>
.spinner {
  color: var(--agent-console-accent);
  display: inline-block;
  text-align: center;
  width: 1ch;
}
</style>
