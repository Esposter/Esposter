<script setup lang="ts">
import type { MapCamera } from "#src/models/map/MapCamera";
import type { Landmark } from "#src/models/world/Landmark";
import type { GameText } from "genshin-text";

import MapDrawing from "#src/components/Map/Drawing/Index.vue";
import MapPointer from "#src/components/Map/Pointer/Index.vue";
import { MAP_MARK_SHARE, MINIMAP_RADIUS } from "#src/services/map/constants";
import { GameTextKey } from "genshin-text";
import { MathUtils } from "three";

interface Props {
  camera: MapCamera;
  // The game's words in the reader's language
  gameText: GameText;
  landmarks: Landmark[];
}

const { camera, gameText, landmarks } = defineProps<Props>();
const emit = defineEmits<{ open: [] }>();
</script>

<template>
  <!-- The map's drawing cut to a circle round the camera and turned with it, so its facing is always up, the pointer at
       Its centre. Pressing it opens the map, as M does -->
  <button class="minimap" type="button" :aria-label="gameText[GameTextKey.Map]" @click="emit('open')">
    <svg
      :viewBox="`${-MINIMAP_RADIUS} ${-MINIMAP_RADIUS} ${MINIMAP_RADIUS * 2} ${MINIMAP_RADIUS * 2}`"
      aria-hidden="true"
    >
      <g :transform="`rotate(${MathUtils.radToDeg(camera.yaw)}) translate(${-camera.x} ${-camera.z})`">
        <MapDrawing :landmarks :mark-radius="MINIMAP_RADIUS * 2 * MAP_MARK_SHARE" />
      </g>
      <MapPointer :size="MINIMAP_RADIUS * 2 * MAP_MARK_SHARE" />
    </svg>
  </button>
</template>

<style scoped>
/* Provisional: the minimap's size, rim and colours, measured off a recording of the English PC client's world HUD */
.minimap {
  width: calc(var(--unit) * 210);
  height: calc(var(--unit) * 210);
  padding: 0;
  overflow: hidden;
  border: calc(var(--unit) * 4) solid rgb(236 229 216 / 0.9);
  border-radius: 50%;
  background: rgb(23 29 41 / 0.6);
  cursor: inherit;
  pointer-events: auto;
}

.minimap svg {
  display: block;
  width: 100%;
  height: 100%;
  /* The drawing's marks answer the overlay's clicks, never the minimap's, whose whole face is one button */
  pointer-events: none;
}
</style>
