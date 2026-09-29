<script setup lang="ts">
import type { TresRendererSetupContext } from "@tresjs/core";

import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { createGenshinRenderer, QualityTier, QualityTierSettingsMap } from "genshin-engine";

const qualityTier = QualityTier.High;
const { maxPixelRatio } = QualityTierSettingsMap[qualityTier];
const agentConsolePanelStore = useAgentConsolePanelStore();
const { isWorldLoaded, isWorldReady } = storeToRefs(agentConsolePanelStore);
// A world that cannot start, where neither WebGPU nor WebGL 2 is available, still lets the loading screen go: the
// Panels work without it
onMounted(() => {
  isWorldLoaded.value = true;
});

onUnmounted(() => {
  isWorldLoaded.value = false;
  isWorldReady.value = false;
});
</script>

<template>
  <div class="world" size-full relative>
    <TresCanvas
      :dpr="[1, maxPixelRatio]"
      :renderer="({ canvas }: TresRendererSetupContext) => createGenshinRenderer(unref(canvas))"
      shadows
      @error="isWorldReady = true"
      @ready="isWorldReady = true"
    >
      <GenshinScene :quality-tier />
    </TresCanvas>
  </div>
</template>

<style scoped>
.world :deep(canvas) {
  /* A drag on the world turns the camera, so a touch is never taken for scrolling or zooming the page */
  touch-action: none;
}
</style>
