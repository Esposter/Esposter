<script setup lang="ts">
import type { MapCamera } from "#src/models/map/MapCamera";
import type { Landmark } from "#src/models/world/Landmark";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { GameText } from "genshin-text";

import MapDrawing from "#src/components/Map/Drawing/Index.vue";
import MapJumpList from "#src/components/Map/JumpList/Index.vue";
import MapPointer from "#src/components/Map/Pointer/Index.vue";
import { computeAreaLabels } from "#src/services/map/computeAreaLabels";
import { computeJumpPose } from "#src/services/map/computeJumpPose";
import { MAP_LABEL_SHARE, MAP_MARGIN, MAP_MARK_SHARE, MINIMAP_RADIUS } from "#src/services/map/constants";
import { catalogue } from "#src/services/world/catalogue";
import { GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  camera: MapCamera;
  // The game's words in the reader's language
  gameText: GameText;
  landmarks: Landmark[];
}

const { camera, gameText, landmarks } = defineProps<Props>();
const emit = defineEmits<{ close: []; jump: [pose: WorldJumpPose] }>();
const closeButton = useTemplateRef("closeButton");
// The square the map shows, round everything it draws: the drawn outlines, the landmarks and the camera, never closer
// In than the minimap shows
const view = computed(() => {
  const points = [
    ...catalogue.regions.flatMap(({ areas }) => areas.flatMap(({ outline }) => outline)),
    ...landmarks.map(({ position }) => position),
    camera,
  ];
  const xs = points.map(({ x }) => x);
  const zs = points.map(({ z }) => z);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const extent = Math.max(maxX - minX, maxZ - minZ, MINIMAP_RADIUS * 2) * (1 + MAP_MARGIN * 2);
  return { extent, x: (minX + maxX - extent) / 2, z: (minZ + maxZ - extent) / 2 };
});
const areaLabels = computed(() => computeAreaLabels(landmarks));
// The map is a dialog over the world, so focus starts inside it
onMounted(() => {
  closeButton.value?.focus();
});
</script>

<template>
  <!-- The map on M: the one drawing of the catalogue across everything it holds, north up, each area's name, the camera
       As a pointer facing its way, and the jump list beside it. A landmark clicked on the map or chosen in the list
       Jumps there -->
  <GameScreen class="map-overlay" role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.Map]">
    <svg class="map" :viewBox="`${view.x} ${view.z} ${view.extent} ${view.extent}`" aria-hidden="true">
      <MapDrawing
        :landmarks
        :mark-radius="view.extent * MAP_MARK_SHARE"
        @select="(landmark) => emit('jump', computeJumpPose(landmark))"
      />
      <text
        v-for="{ id, name, x, z } of areaLabels"
        :key="id"
        class="area-name"
        :font-size="view.extent * MAP_LABEL_SHARE"
        :x
        :y="z"
      >
        {{ name }}
      </text>
      <MapPointer :size="view.extent * MAP_MARK_SHARE" :x="camera.x" :yaw="camera.yaw" :z="camera.z" />
    </svg>
    <MapJumpList class="jumps" :game-text :landmarks @jump="(landmark) => emit('jump', computeJumpPose(landmark))" />
    <button
      ref="closeButton"
      class="close"
      type="button"
      :aria-label="gameText[GameTextKey.Back]"
      @click="emit('close')"
    >
      <svg viewBox="-1 -1 2 2" aria-hidden="true"><path d="M -0.6 -0.6 L 0.6 0.6 M 0.6 -0.6 L -0.6 0.6" /></svg>
    </button>
  </GameScreen>
</template>

<style scoped>
/* Provisional: the map's look, measured off the game's map with the HUD's reference */
.map-overlay {
  background: rgb(23 29 41 / 0.92);
}

.map {
  position: absolute;
  inset: 0 calc(var(--unit) * 480) 0 0;
  width: calc(100% - var(--unit) * 480);
  height: 100%;
}

.area-name {
  fill: #ece5d8;
  text-anchor: middle;
  dominant-baseline: middle;
}

.jumps {
  position: absolute;
  top: calc(var(--unit) * 120);
  right: calc(var(--unit) * 48);
  bottom: calc(var(--unit) * 48);
  width: calc(var(--unit) * 400);
}

.close {
  position: absolute;
  top: calc(var(--unit) * 32);
  right: calc(var(--unit) * 48);
  display: grid;
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  padding: calc(var(--unit) * 12);
  border: none;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.12);
  cursor: inherit;
  place-items: center;
}

.close svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: #ece5d8;
  stroke-width: 0.2;
}
</style>
