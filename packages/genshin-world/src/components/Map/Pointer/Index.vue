<script setup lang="ts">
import { MathUtils } from "three";

interface Props {
  // How far the pointer's disc reaches from its point, in the view's metres
  size: number;
  x?: number;
  // The yaw the view faces, in radians, as the camera turns it
  yaw?: number;
  z?: number;
}

const { size, x = 0, yaw = 0, z = 0 } = defineProps<Props>();
</script>

<template>
  <!-- The player on the map: a disc with a white cap above it that points the way the view faces, north at a yaw of
       None, and turned the other way about the vertical than three turns it, since the map looks down on the ground.
       A dark tip hangs under it -->
  <g :transform="`translate(${x} ${z}) rotate(${-MathUtils.radToDeg(yaw)}) scale(${size})`">
    <circle class="rim" r="1.35" />
    <circle class="disc" r="1" />
    <path class="cap" d="M -0.7 -1 L 0 -2.2 L 0.7 -1 Z" />
    <path class="cap" d="M -0.6 1.1 L 0 2.1 L 0.6 1.1 Z" />
    <path class="tip" d="M -0.25 1.1 L 0 1.9 L 0.25 1.1 Z" />
  </g>
</template>

<style scoped>
/* Provisional: the pointer's colours measured off the English PC client's map over Jueyun Karst at 1080 high */
.rim {
  fill: #fff;
  stroke: #849493;
  stroke-width: 0.15;
  vector-effect: non-scaling-stroke;
}

.disc {
  fill: #97edf2;
  stroke: #3d96ca;
  stroke-width: 0.15;
  vector-effect: non-scaling-stroke;
}

.cap {
  fill: #fff;
}

.tip {
  fill: #2c2c2c;
}
</style>
