<script setup lang="ts">
import type { TresRendererSetupContext } from "@tresjs/core";

import { GENSHIN_REGION_DATA_BASE_URL } from "#shared/services/genshin/constants";
import { IS_DEVELOPMENT } from "#shared/util/environment/constants";
import { createGenshinRenderer, GENSHIN_TONE_MAPPING, QualityTier, QualityTierSettingsMap } from "genshin-engine";
import { GenshinWorld } from "genshin-world";
import TerrainTileWorker from "genshin-world/terrainTileWorker?worker";
import { PCFShadowMap } from "three";

interface Props {
  // Whether something covers the world, which then keeps loading but draws no frames until it is shown
  isPaused?: true;
}

const { isPaused } = defineProps<Props>();
const emit = defineEmits<{ load: []; ready: [] }>();
const qualityTier = QualityTier.High;
const { maxPixelRatio } = QualityTierSettingsMap[qualityTier];
const canvas = useTemplateRef("canvas");
// @TODO: no upstream issue — TresJS draws only while it owes a frame, and always mode owes one only once it has drawn,
// So a canvas switched from manual, having drawn the frame it was owed, never draws again. The uncovered world is owed
// One while the canvas is still manual, before its props change
watch(
  () => isPaused,
  (newIsPaused) => {
    if (!newIsPaused) canvas.value?.context.renderer.advance();
  },
  { flush: "sync" },
);
// A world that cannot start, where neither WebGPU nor WebGL 2 is available, is ready all the same, so the opening
// Still finishes
onMounted(() => {
  emit("load");
});
</script>

<template>
  <div class="world" size-full>
    <TresCanvas
      ref="canvas"
      :dpr="[1, maxPixelRatio]"
      :renderer="({ canvas }: TresRendererSetupContext) => createGenshinRenderer(unref(canvas))"
      :render-mode="isPaused ? 'manual' : 'always'"
      :tone-mapping="GENSHIN_TONE_MAPPING"
      shadows
      :shadow-map-type="PCFShadowMap"
      @error="emit('ready')"
      @ready="emit('ready')"
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
