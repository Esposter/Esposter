<script setup lang="ts">
import type { TresCanvasInstance, TresRendererSetupContext } from "@tresjs/core";
import type { QualityTier } from "genshin-engine";

import WorldWindrise from "#src/components/World/Windrise/Index.vue";
import { OrbitControls } from "@tresjs/cientos";
import { TresCanvas } from "@tresjs/core";
import { createGenshinRenderer, GENSHIN_TONE_MAPPING, QualityTierSettingsMap } from "genshin-engine";
import { PCFShadowMap } from "three";
import { unref } from "vue";

interface Props {
  createTerrainWorker: () => Worker;
  // Whether something covers the world, which then keeps loading but draws no frames until it is shown
  isPaused?: true;
  // Whether the development tuning panel is shown, which the host decides
  isTuning?: true;
  qualityTier: QualityTier;
  // Where the host serves each region's data, fetched by id as the camera comes within reach
  regionDataBaseUrl: string;
}

const { createTerrainWorker, isPaused, isTuning, qualityTier, regionDataBaseUrl } = defineProps<Props>();
const emit = defineEmits<{ ready: [] }>();
const { maxPixelRatio } = QualityTierSettingsMap[qualityTier];
const canvas = useTemplateRef<TresCanvasInstance>("canvas");
// The world on its own canvas: the camera circling Windrise's oak, and the scene it looks at. A world that cannot
// Start, where neither WebGPU nor WebGL 2 is available, is ready all the same, so a host waiting on it still moves on
// @TODO: no upstream issue — TresJS draws only while it owes a frame, and always mode owes one only once it has drawn,
// So a canvas switched from manual, having drawn the frame it was owed, never draws again. The uncovered world is owed
// One while the canvas is still manual, before its props change
watch(
  () => isPaused,
  (newIsPaused) => {
    if (!newIsPaused) canvas.value?.context?.renderer.advance();
  },
  { flush: "sync" },
);
</script>

<template>
  <div class="world-screen" size-full>
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
      <TresPerspectiveCamera :far="2000" :fov="45" :look-at="[0, 14, 0]" :position="[62, 26, 58]" />
      <OrbitControls
        make-default
        :max-distance="220"
        :max-polar-angle="Math.PI * 0.47"
        :min-distance="12"
        :target="[0, 14, 0]"
      />
      <WorldWindrise :create-terrain-worker :is-tuning="Boolean(isTuning)" :quality-tier :region-data-base-url />
    </TresCanvas>
  </div>
</template>

<style scoped>
.world-screen :deep(canvas) {
  /* A drag on the world turns the camera, so a touch is never taken for scrolling or zooming the page */
  touch-action: none;
}
</style>
