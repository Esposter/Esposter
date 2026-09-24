<script setup lang="ts">
import { SPINNER_FRAMES, SPINNER_INTERVAL_MS } from "@/services/ui/constants";
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
  <span aria-hidden="true" text-accent text-center w-1ch inline-block>{{ takeOne(SPINNER_FRAMES, frameIndex) }}</span>
</template>
