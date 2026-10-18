<script setup lang="ts">
import type { NavigationMark } from "#src/models/map/NavigationMark";
import type { Landmark } from "#src/models/world/Landmark";
import type { Camera } from "three";

import { computeNavigationMark } from "#src/services/map/computeNavigationMark";
import { useRafFn } from "@vueuse/core";
import { GameScreen } from "genshin-interface";
import { MathUtils, Vector3 } from "three";

interface Props {
  // The camera the world is drawn through, none until the canvas has one
  getCamera: () => Camera | undefined;
  // The world's ground at a point in its own coordinates, which the landmark stands on
  getGroundHeight: (x: number, z: number) => number;
  // The locked landmark the HUD points to, none while it points to none
  landmark?: Landmark;
  // The world coordinate the scene's origin stands on, taken off the landmark's place before it is projected through
  // The camera
  origin: Vector3;
}

const { getCamera, getGroundHeight, landmark, origin } = defineProps<Props>();
const navigationMark = shallowRef<NavigationMark>();
const point = new Vector3();
// The landmark is projected through the camera each frame where it stands, its base on the ground beneath it, and the
// Mark is handed on only while there is a landmark to draw, so nothing pointed to re-renders nothing
useRafFn(() => {
  const camera = getCamera();
  if (!camera || !landmark) {
    if (navigationMark.value) navigationMark.value = undefined;
    return;
  }
  const { heightOffset, position } = landmark;
  point
    .set(position.x - origin.x, getGroundHeight(position.x, position.z) + heightOffset, position.z - origin.z)
    .applyMatrix4(camera.matrixWorldInverse);
  const isBehind = point.z > 0;
  point.applyMatrix4(camera.projectionMatrix);
  // The projection's scale on each axis, whose ratio is the view's width over its height, perspective or orthographic
  const { elements } = camera.projectionMatrix;
  navigationMark.value = computeNavigationMark(point, isBehind, elements[5] / elements[0]);
});
</script>

<template>
  <!-- The game's navigation mark on the HUD: a disc at the pointed landmark's place on the screen, or held at the screen's
       Edge with its arrow turned toward the landmark while the landmark is out of view. Its own screen, so it reads the
       Same `--unit` as the HUD's pieces and lets every press through to the world -->
  <GameScreen class="navigation">
    <svg
      v-if="navigationMark"
      class="mark"
      viewBox="-10 -10 20 20"
      aria-hidden="true"
      :style="{ left: `${navigationMark.left * 100}%`, top: `${navigationMark.top * 100}%` }"
    >
      <circle class="disc" r="5" />
      <path
        v-if="navigationMark.isOutOfView"
        class="arrow"
        d="M 0 -10 L 3.5 -6 L -3.5 -6 Z"
        :transform="`rotate(${MathUtils.radToDeg(navigationMark.angle)})`"
      />
    </svg>
  </GameScreen>
</template>

<style scoped>
.navigation {
  pointer-events: none;
}

/* Provisional: the mark's size, its disc and its colour, until the clip's frames are measured against the game's pointer */
.mark {
  position: absolute;
  width: calc(var(--unit) * 24);
  height: calc(var(--unit) * 24);
  overflow: visible;
  translate: -50% -50%;
}

.disc {
  fill: rgb(2 207 251);
  stroke: #fff;
  stroke-width: 1;
}

.arrow {
  fill: rgb(2 207 251);
  stroke: #fff;
  stroke-width: 0.6;
}
</style>
