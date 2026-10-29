<script setup lang="ts">
import type { DevFrameStats, DevRegistry } from "genshin-world";

import { createFrameStatsSampler } from "genshin-world";
import { useRafFn } from "@vueuse/core";

interface Props {
  registry: DevRegistry;
}

// The stats overlay, a frame at the top left: the median frame time, and the draw calls and triangles the renderer counted
// For the last frame. It reads the renderer on each frame the browser draws while it is mounted, and the sampler answers
// Stats on every tenth frame, so an overlay that is switched off, and so unmounted, costs no frame at all
const { registry } = defineProps<Props>();
const sampler = createFrameStatsSampler();
const frameStats = shallowRef<DevFrameStats>();
let previousFrameTime = performance.now();
useRafFn(() => {
  const frameTime = performance.now();
  const renderer = registry.getRenderer();
  if (renderer) {
    const stats = sampler.sample(frameTime - previousFrameTime, renderer.info);
    if (stats) frameStats.value = stats;
  }

  previousFrameTime = frameTime;
});
</script>

<template>
  <UiFrame fixed top-0 left-0 title="Stats">
    <p v-if="frameStats" ui-body>
      Frame {{ frameStats.frameMilliseconds.toFixed(1) }} ms, {{ frameStats.drawCalls }} draw calls,
      {{ frameStats.triangles }} triangles
    </p>
    <p v-else ui-body>Waiting for the first frames</p>
  </UiFrame>
</template>
