<script setup lang="ts">
import type { WorldCameraPose } from "#src/models/world/WorldCameraPose";
import type { TresCanvasInstance, TresContextWithClock, TresRendererSetupContext } from "@tresjs/core";
import type { QualityTier } from "genshin-engine";
import type { GameText } from "genshin-text";

import MenuScreen from "#src/components/Menu/Screen/Index.vue";
import WorldFreeCamera from "#src/components/World/FreeCamera/Index.vue";
import WorldWindrise from "#src/components/World/Windrise/Index.vue";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { SceneWitnessKey } from "#src/services/scene/SceneWitnessKey";
import { getNextScreenKind } from "#src/services/screen/getNextScreenKind";
import { ScreenBehaviourMap } from "#src/services/screen/ScreenBehaviourMap";
import { TresCanvas } from "@tresjs/core";
import { useEventListener } from "@vueuse/core";
import { createGenshinRenderer, createInput, GENSHIN_TONE_MAPPING, QualityTierSettingsMap } from "genshin-engine";
import { Euler, MathUtils, PCFShadowMap, Vector3 } from "three";
import { unref } from "vue";

interface Props {
  // A camera held still, as a reference of the game's sees the world, in place of the one circling the oak
  cameraPose?: WorldCameraPose;
  createTerrainWorker: () => Worker;
  // The game's words in the reader's language
  gameText: GameText;
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

const { cameraPose, createTerrainWorker, gameText, heldMinutes, isPaused, isTuning, qualityTier, regionDataBaseUrl } =
  defineProps<Props>();
// Quitting the game leaves the world, which its host does
const emit = defineEmits<{ quit: []; ready: [] }>();
const { maxPixelRatio } = QualityTierSettingsMap[qualityTier];
const canvas = useTemplateRef<TresCanvasInstance>("canvas");
// A witness render's tools set the camera themselves, which the controls would move off the pose they set
// oxlint-disable-next-line no-restricted-globals -- the parity page reaches a published scene's own parts with no prop for a host to see
const witness = inject(SceneWitnessKey, null);
// The keys, pointer and gamepad, read once a frame ahead of everything the frame moves, which reads the same state
const controller = new AbortController();
const input = createInput(window, controller.signal);
const inputState = input.readInput(0);
// What is open over the world, one screen at a time, and what it does to the world under it
const screenKind = ref(ScreenKind.World);
const screenBehaviour = computed(() => ScreenBehaviourMap[screenKind.value]);
// A screen with a cursor of its own lets the pointer go, which a click on the world takes again once it closes
watch(
  () => screenBehaviour.value.isPointerReleased,
  (isPointerReleased) => {
    if (isPointerReleased) window.document.exitPointerLock();
  },
);
// The browser keeps Escape for itself while the pointer is locked, letting the lock go in place of passing the key on,
// So a lock lost with the world in play opens the Paimon menu as Escape does
useEventListener(
  () => window.document,
  "pointerlockchange",
  () => {
    if (window.document.pointerLockElement === null && screenKind.value === ScreenKind.World)
      screenKind.value = ScreenKind.PaimonMenu;
  },
);
onUnmounted(() => {
  controller.abort();
});
// The world's origin, owned here so the free camera reads the ground through it before the floating origin shifts it
const origin = new Vector3();
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
      @before-loop="
        (context: TresContextWithClock) => {
          input.readInput(context.delta);
          if (!isPaused) screenKind = getNextScreenKind(screenKind, inputState.pressedActions);
        }
      "
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
        <WorldFreeCamera v-if="!witness" :input-state :is-held="screenBehaviour.isHeld || undefined" :origin />
      </template>
      <WorldWindrise
        :create-terrain-worker
        :held-minutes
        :is-held="screenBehaviour.isHeld || undefined"
        :is-tuning="Boolean(isTuning)"
        :origin
        :quality-tier
        :region-data-base-url
        @ready="emit('ready')"
      />
    </TresCanvas>
    <MenuScreen v-model:screen-kind="screenKind" :game-text @quit="emit('quit')" />
  </div>
</template>

<style scoped>
/* The package carries no utility classes, so the screen fills its host with a style of its own */
.world-screen {
  position: relative;
  width: 100%;
  height: 100%;
}

.world-screen :deep(canvas) {
  /* A drag on the world turns the camera, so a touch is never taken for scrolling or zooming the page */
  touch-action: none;
}
</style>
