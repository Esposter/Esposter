<script setup lang="ts">
import { MAP_POINTER_PATH } from "#src/services/map/constants";
import { MathUtils } from "three";

interface Props {
  // How far the pointer reaches from its point, in the view's metres
  size: number;
  x?: number;
  // The yaw the view faces, in radians, as the camera turns it
  yaw?: number;
  z?: number;
}

const { size, x = 0, yaw = 0, z = 0 } = defineProps<Props>();
</script>

<template>
  <!-- The player on the map, pointing the way the view faces: north at a yaw of none, and turned the other way about
       The vertical than three turns it, since the map looks down on the ground -->
  <path
    class="pointer"
    :d="MAP_POINTER_PATH"
    :transform="`translate(${x} ${z}) rotate(${-MathUtils.radToDeg(yaw)}) scale(${size})`"
  />
</template>

<style scoped>
/* Provisional: the pointer's look, measured off the game's map with the HUD's reference */
.pointer {
  fill: #ffd780;
  stroke: rgb(0 0 0 / 0.6);
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}
</style>
