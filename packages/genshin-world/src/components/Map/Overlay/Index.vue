<script setup lang="ts">
import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { MapCamera } from "#src/models/map/MapCamera";
import type { Landmark } from "#src/models/world/Landmark";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { GameText } from "genshin-text";

import MapDrawing from "#src/components/Map/Drawing/Index.vue";
import MapJumpList from "#src/components/Map/JumpList/Index.vue";
import MapPointer from "#src/components/Map/Pointer/Index.vue";
import { Currency } from "#src/models/inventory/Currency";
import { computeExplorationProgress } from "#src/services/exploration/computeExplorationProgress";
import { computeExploredDoingIds } from "#src/services/exploration/computeExploredDoingIds";
import { computeAreaLabels } from "#src/services/map/computeAreaLabels";
import { computeJumpPose } from "#src/services/map/computeJumpPose";
import { computeWheelZoomMetres } from "#src/services/map/computeWheelZoomMetres";
import { computeZoomMetresAtShare } from "#src/services/map/computeZoomMetresAtShare";
import { computeZoomShare } from "#src/services/map/computeZoomShare";
import {
  MAP_DRAG_THRESHOLD_PIXELS,
  MAP_LABEL_OUTLINE_SHARE,
  MAP_LABEL_SHARE,
  MAP_OVERLAY_MARK_SHARE,
  MAP_PROGRESS_OFFSET_SHARE,
  MAP_PROGRESS_SHARE,
  MAP_VIEW_METRES,
  MAP_ZOOM_DRAWING_HEIGHT,
  MAP_ZOOM_TRACK_HEIGHT,
  MAP_ZOOM_TRACK_TOP,
} from "#src/services/map/constants";
import { ORIGINAL_RESIN_CAP } from "#src/services/originalResin/constants";
import { regenerateOriginalResin } from "#src/services/originalResin/regenerateOriginalResin";
import { GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  camera: MapCamera;
  // The areas whose exploration the map counts, each area's progress shown on its name once the area is filled in
  explorationAreas: ExplorationArea[];
  // The game's words in the reader's language
  gameText: GameText;
  landmarks: Landmark[];
  // The wallet, whose Original Resin the top bar counts as it regenerates to the moment the map opens
  wallet: Wallet;
}

const { camera, explorationAreas, gameText, landmarks, wallet } = defineProps<Props>();
const emit = defineEmits<{ close: []; jump: [pose: WorldJumpPose] }>();
const closeButton = useTemplateRef("closeButton");
const map = useTemplateRef("map");
const zoomTrack = useTemplateRef("zoomTrack");
// The drawn metres across the map's width, which the wheel and the slider change from the default, and the offset the
// Map is dragged to from the player
const metres = ref(MAP_VIEW_METRES);
const pan = ref({ x: 0, z: 0 });
const view = computed(() => ({
  x: camera.x + pan.value.x - metres.value / 2,
  z: camera.z + pan.value.z - metres.value / 2,
}));
const markRadius = computed(() => metres.value * MAP_OVERLAY_MARK_SHARE);
const zoomThumbY = computed(() => MAP_ZOOM_TRACK_TOP + computeZoomShare(metres.value) * MAP_ZOOM_TRACK_HEIGHT);
// A press's start and last place, whether it has travelled far enough to pan, and whether the slider is being dragged.
// These are not drawn, so they are plain variables rather than state
let pressStart = { x: 0, y: 0 };
let pointer = { x: 0, y: 0 };
let isPanning = false;
let isDragged = false;
let isSlidingZoom = false;
const onMapPointerDown = (event: PointerEvent) => {
  isPanning = true;
  isDragged = false;
  pressStart = { x: event.clientX, y: event.clientY };
  pointer = pressStart;
};
const onMapPointerMove = (event: PointerEvent) => {
  if (!isPanning || !map.value) return;
  // The pointer is captured only once the press is a drag, since a captured press's click lands on the map rather than
  // On the landmark it was made on
  if (
    !isDragged &&
    Math.hypot(event.clientX - pressStart.x, event.clientY - pressStart.y) > MAP_DRAG_THRESHOLD_PIXELS
  ) {
    isDragged = true;
    map.value.setPointerCapture(event.pointerId);
  }
  const { height, width } = map.value.getBoundingClientRect();
  // The map is drawn over the screen's larger side, so a pixel is that many metres of the drawn width
  const metresPerPixel = metres.value / Math.max(width, height);
  pan.value = {
    x: pan.value.x - (event.clientX - pointer.x) * metresPerPixel,
    z: pan.value.z - (event.clientY - pointer.y) * metresPerPixel,
  };
  pointer = { x: event.clientX, y: event.clientY };
};
const onMapPointerUp = () => {
  isPanning = false;
};
// A drag that ends on a landmark is not a choice of it, so the click that follows it is stopped before the landmark
const onMapClickCapture = (event: MouseEvent) => {
  if (!isDragged) return;
  event.stopPropagation();
  isDragged = false;
};
const setZoomAtPointer = (clientY: number) => {
  if (!zoomTrack.value) return;
  const { height, top } = zoomTrack.value.getBoundingClientRect();
  const drawingY = ((clientY - top) / height) * MAP_ZOOM_DRAWING_HEIGHT;
  metres.value = computeZoomMetresAtShare((drawingY - MAP_ZOOM_TRACK_TOP) / MAP_ZOOM_TRACK_HEIGHT);
};
const onZoomPointerDown = (event: PointerEvent) => {
  isSlidingZoom = true;
  zoomTrack.value?.setPointerCapture(event.pointerId);
  setZoomAtPointer(event.clientY);
};
const onZoomPointerMove = (event: PointerEvent) => {
  if (isSlidingZoom) setZoomAtPointer(event.clientY);
};
const onZoomPointerUp = () => {
  isSlidingZoom = false;
};
// Each counted area's progress as the unlocked landmarks leave it, keyed by its catalogue area
const explorationProgressMap = computed(
  () =>
    new Map(
      explorationAreas.map((area) => [
        area.areaId,
        computeExplorationProgress(area, computeExploredDoingIds(area, landmarks)),
      ]),
    ),
);
const areaLabels = computed(() =>
  computeAreaLabels(landmarks).map(({ id, name, x, z }) => ({
    id,
    name,
    progress: explorationProgressMap.value.get(id),
    x,
    z,
  })),
);
// The filled areas' progress, read out of the hidden drawing by a screen reader as a list of its own
const areaProgresses = computed(() =>
  areaLabels.value.flatMap(({ id, name, progress }) => (progress ? [{ id, name, progress }] : [])),
);
const originalResin = computed(() => regenerateOriginalResin(wallet, Temporal.Now.instant())[Currency.OriginalResin]);
// The map is a dialog over the world, so focus starts inside it
onMounted(() => {
  closeButton.value?.focus();
});
</script>

<template>
  <!-- The map on M, full screen as the game shows it: the one drawing of the catalogue placed on the player, north
       Up, each area's name and the player's pointer, the close button and the zoom slider. The jump list is kept for the
       Keyboard and a screen reader, since the game shows no list, and each filled area's progress is listed for a screen
       Reader beside the hidden drawing. A landmark chosen on the map or in the list jumps there -->
  <GameScreen class="map-overlay" role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.Map]">
    <svg
      ref="map"
      class="map"
      :viewBox="`${view.x} ${view.z} ${metres} ${metres}`"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      @click.capture="(event) => onMapClickCapture(event)"
      @pointercancel="onMapPointerUp()"
      @pointerdown="(event) => onMapPointerDown(event)"
      @pointermove="(event) => onMapPointerMove(event)"
      @pointerup="onMapPointerUp()"
      @wheel="metres = computeWheelZoomMetres(metres, $event.deltaY)"
    >
      <MapDrawing :landmarks :mark-radius @select="(landmark) => emit('jump', computeJumpPose(landmark))" />
      <template v-for="{ id, name, progress, x, z } of areaLabels" :key="id">
        <text
          class="area-name"
          :font-size="metres * MAP_LABEL_SHARE"
          :stroke-width="metres * MAP_LABEL_OUTLINE_SHARE"
          :x
          :y="z"
        >
          {{ name }}
        </text>
        <text
          v-if="progress"
          class="area-progress"
          :font-size="metres * MAP_PROGRESS_SHARE"
          :stroke-width="metres * MAP_LABEL_OUTLINE_SHARE"
          :x
          :y="z + metres * MAP_PROGRESS_OFFSET_SHARE"
        >
          {{ progress.doneCount }}/{{ progress.doingCount }} {{ progress.percentage }}%
        </text>
      </template>
      <MapPointer :size="markRadius" :x="camera.x" :yaw="camera.yaw" :z="camera.z" />
    </svg>
    <svg
      ref="zoomTrack"
      class="zoom"
      viewBox="0 0 56 270"
      aria-hidden="true"
      @pointercancel="onZoomPointerUp()"
      @pointerdown="(event) => onZoomPointerDown(event)"
      @pointermove="(event) => onZoomPointerMove(event)"
      @pointerup="onZoomPointerUp()"
    >
      <rect class="zoom-track" x="23" y="43" width="10" height="194" rx="5" />
      <path class="zoom-stop" d="M 28 16.5 L 39.5 28 L 28 39.5 L 16.5 28 Z" />
      <path class="zoom-sign" d="M 28 22 V 34 M 22 28 H 34" />
      <path class="zoom-stop" d="M 28 110.5 L 40.5 123 L 28 135.5 L 15.5 123 Z" />
      <path class="zoom-stop" d="M 28 241.5 L 39.5 253 L 28 264.5 L 16.5 253 Z" />
      <path class="zoom-sign" d="M 22 253 H 34" />
      <path class="zoom-thumb" d="M 0 -7 L 4 0 L 0 7 L -4 0 Z" :transform="`translate(28 ${zoomThumbY})`" />
    </svg>
    <ul class="progress-list">
      <li v-for="{ id, name, progress } of areaProgresses" :key="id">
        {{ name }} {{ progress.doneCount }}/{{ progress.doingCount }} {{ progress.percentage }}%
      </li>
    </ul>
    <MapJumpList class="jumps" :game-text :landmarks @jump="(landmark) => emit('jump', computeJumpPose(landmark))" />
    <p class="resin">
      <span>{{ gameText[GameTextKey.OriginalResin] }}</span>
      <span>{{ originalResin }}/{{ ORIGINAL_RESIN_CAP }}</span>
    </p>
    <button
      ref="closeButton"
      class="close"
      type="button"
      :aria-label="gameText[GameTextKey.Back]"
      @click="emit('close')"
    >
      <svg viewBox="-1 -1 2 2" aria-hidden="true">
        <path
          d="M -0.7 -0.7 L 0.7 0.7 M 0.7 -0.7 L -0.7 0.7 M -0.7 -0.7 h 0.45 M -0.7 -0.7 v 0.45 M 0.7 -0.7 h -0.45 M 0.7 -0.7 v 0.45 M -0.7 0.7 h 0.45 M -0.7 0.7 v -0.45 M 0.7 0.7 h -0.45 M 0.7 0.7 v -0.45"
        />
      </svg>
    </button>
  </GameScreen>
</template>

<style scoped>
/* Provisional: the colours and the zoom slider's place measured off the English PC client's map over Jueyun Karst at
   1080 high; the map's terrain is the game's painted art, which is not drawn here */
.map-overlay {
  background: #111317;
}

/* Provisional: the player's pointer sits 45 units right of and 50 units under the screen's centre in the reference, so
   the drawing is centred on that place, the screen's own centre offset to it */
.map {
  position: absolute;
  top: calc(var(--unit) * 50);
  left: calc(var(--unit) * 45);
  width: 100%;
  height: 100%;
  touch-action: none;
}

.area-name,
.area-progress {
  fill: #ece5d7;
  paint-order: stroke;
  stroke: rgb(0 0 0 / 0.5);
  text-anchor: middle;
  dominant-baseline: middle;
}

.zoom {
  position: absolute;
  top: calc(var(--unit) * 400);
  left: 0;
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 270);
  touch-action: none;
}

.zoom-track {
  fill: #111317;
  stroke: rgb(255 255 255 / 0.35);
  stroke-width: 0.8;
}

.zoom-stop,
.zoom-thumb {
  fill: #ede4e0;
  stroke: #111317;
  stroke-width: 1;
  stroke-linejoin: round;
}

.zoom-thumb {
  fill: #4b5367;
  stroke: none;
}

.zoom-sign {
  fill: none;
  stroke: #384150;
  stroke-width: 2.2;
  stroke-linecap: round;
}

.jumps,
.progress-list {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Provisional: the resin counter's place, left of the close button, and its type, until a recording of the English PC
   client's map top bar measures them */
.resin {
  position: absolute;
  top: calc(var(--unit) * 40);
  right: calc(var(--unit) * 130);
  display: flex;
  gap: calc(var(--unit) * 14);
  margin: 0;
  color: #ece5d7;
  font-size: calc(var(--unit) * 26);
}

.close {
  position: absolute;
  top: calc(var(--unit) * 18);
  right: calc(var(--unit) * 49);
  display: grid;
  width: calc(var(--unit) * 57);
  height: calc(var(--unit) * 57);
  padding: calc(var(--unit) * 9);
  border: calc(var(--unit) * 5) solid #849493;
  border-radius: 50%;
  background: #ece5d7;
  cursor: inherit;
  place-items: center;
}

.close svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: #384150;
  stroke-width: 0.26;
}
</style>
