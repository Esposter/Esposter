<script setup lang="ts">
import type { RenderStatistics } from "@/models/agentConsole/world/RenderStatistics";

import { STATISTICS_INTERVAL_MS } from "@/services/agentConsole/world/constants";

interface Props {
  renderStatistics: RenderStatistics;
}

const { renderStatistics } = defineProps<Props>();
const framesPerSecond = ref(0);
const drawCalls = ref(0);
const triangles = ref(0);
let lastRenderCount = 0;
// Counted once a second rather than on every frame, so the overlay reads as the frame rate
useIntervalFn(() => {
  framesPerSecond.value = renderStatistics.renderCount - lastRenderCount;
  lastRenderCount = renderStatistics.renderCount;
  drawCalls.value = renderStatistics.drawCalls;
  triangles.value = renderStatistics.triangles;
}, STATISTICS_INTERVAL_MS);
</script>

<template>
  <div class="statistics">{{ framesPerSecond }} fps · {{ drawCalls }} draws · {{ triangles }} triangles</div>
</template>

<style scoped>
.statistics {
  color: var(--agent-console-muted);
  pointer-events: none;
}
</style>
