<script setup lang="ts">
import type { TresRendererSetupContext } from "@tresjs/core";

import { useAgentConsolePanelStore } from "@/store/agentConsole/panel";
import { IS_DEVELOPMENT } from "#shared/util/environment/constants";
import { GENSHIN_REGION_DATA_BASE_URL } from "#shared/services/genshin/constants";
import { GenshinWorld } from "@esposter/genshin-world";
import TerrainTileWorker from "@esposter/genshin-world/terrainTileWorker?worker";
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
      <GenshinWorld
        :create-terrain-worker="() => new TerrainTileWorker()"
        :is-tuning="IS_DEVELOPMENT"
        :quality-tier
        :region-data-base-url="GENSHIN_REGION_DATA_BASE_URL"
      />
    </TresCanvas>
  </div>
</template>

<style scoped>
.world :deep(canvas) {
  /* A drag on the world turns the camera, so a touch is never taken for scrolling or zooming the page */
  touch-action: none;
}
</style>
