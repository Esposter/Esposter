<script setup lang="ts">
import type { WorldCameraPose } from "#src/models/world/WorldCameraPose";
import type { TresCanvasInstance, TresRendererSetupContext } from "@tresjs/core";
import type { QualityTier } from "genshin-engine";

import WorldWindrise from "#src/components/World/Windrise/Index.vue";
import { SceneWitnessKey } from "#src/services/scene/SceneWitnessKey";
import { OrbitControls } from "@tresjs/cientos";
import { TresCanvas } from "@tresjs/core";
import { createGenshinRenderer, GENSHIN_TONE_MAPPING, QualityTierSettingsMap } from "genshin-engine";
import { Euler, MathUtils, PCFShadowMap } from "three";
import { unref } from "vue";

interface Props {
  // A camera held still, as a reference of the game's sees the world, in place of the one circling the oak
  cameraPose?: WorldCameraPose;
  createTerrainWorker: () => Worker;
  // The game's minute of the day the clock is held at, as a reference of the game's shows it
  heldMinutes?: number;
  // Whether something covers the world, which then keeps loading but draws no frames until it is shown
  isPaused?: true;
  // Whether the development tuning panel is shown, which the host decides
  isTuning?: true;
  qualityTier: QualityTier;
  // Where the host serves each region's data, fetched by id as the camera comes within reach
  regionDataBaseUrl: string;
}

const { cameraPose, createTerrainWorker, heldMinutes, isPaused, isTuning, qualityTier, regionDataBaseUrl } =
  defineProps<Props>();
const emit = defineEmits<{ ready: [] }>();
const { maxPixelRatio } = QualityTierSettingsMap[qualityTier];
const canvas = useTemplateRef<TresCanvasInstance>("canvas");
// A witness render's tools set the camera themselves, which the controls would move off the pose they set
const witness = inject(SceneWitnessKey, null);
const cameraRotation = computed(() =>
  cameraPose
    ? new Euler(MathUtils.degToRad(cameraPose.pitch), MathUtils.degToRad(cameraPose.heading), 0, "YXZ")
    : undefined,
);
// The world on its own canvas: the camera circling Windrise's oak, and the scene it looks at. It is ready once the
// Scene has the ground and the landmarks of its first view, which keep loading while the world is paused. A world that
// Cannot start, where neither WebGPU nor WebGL 2 is available, is ready all the same, so a host waiting on it moves on
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
  <div class="world-screen">
    <TresCanvas
      ref="canvas"
      :dpr="[1, maxPixelRatio]"
      :renderer="({ canvas }: TresRendererSetupContext) => createGenshinRenderer(unref(canvas))"
      :render-mode="isPaused ? 'manual' : 'always'"
      :tone-mapping="GENSHIN_TONE_MAPPING"
      shadows
      :shadow-map-type="PCFShadowMap"
      @error="emit('ready')"
    >
      <TresPerspectiveCamera
        v-if="cameraPose"
        :far="2000"
        :fov="cameraPose.fov"
        :position="cameraPose.position"
        :rotation="cameraRotation"
      />
      <template v-else>
        <TresPerspectiveCamera :far="2000" :fov="45" :look-at="[0, 14, 0]" :position="[62, 26, 58]" />
        <OrbitControls
          v-if="!witness"
          make-default
          :max-distance="220"
          :max-polar-angle="Math.PI * 0.47"
          :min-distance="12"
          :target="[0, 14, 0]"
        />
      </template>
      <WorldWindrise
        :create-terrain-worker
        :held-minutes
        :is-tuning="Boolean(isTuning)"
        :quality-tier
        :region-data-base-url
        @ready="emit('ready')"
      />
    </TresCanvas>
  </div>
</template>

<style scoped>
/* The package carries no utility classes, so the screen fills its host with a style of its own */
.world-screen {
  width: 100%;
  height: 100%;
}

.world-screen :deep(canvas) {
  /* A drag on the world turns the camera, so a touch is never taken for scrolling or zooming the page */
  touch-action: none;
}
</style>
