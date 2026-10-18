<script setup lang="ts">
import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { MapCamera } from "#src/models/map/MapCamera";
import type { Catalogue } from "#src/models/world/Catalogue";
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
import { computeJumpLandmarkTextKey } from "#src/services/map/computeJumpLandmarkTextKey";
import { computeJumpPose } from "#src/services/map/computeJumpPose";
import { computeWheelZoomMetres } from "#src/services/map/computeWheelZoomMetres";
import { computeZoomMetresAtShare } from "#src/services/map/computeZoomMetresAtShare";
import { computeZoomShare } from "#src/services/map/computeZoomShare";
import { findAreaAt } from "#src/services/map/findAreaAt";
import { findLandmarkArea } from "#src/services/map/findLandmarkArea";
import {
  MAP_DRAG_THRESHOLD_PIXELS,
  MAP_GROUND,
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
import { GameButton, GameButtonKind, GameScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey, splitGameTextColors } from "genshin-text";

interface Props {
  camera: MapCamera;
  // The regions and their areas, which the map draws and names
  catalogue: Catalogue;
  // The areas whose exploration the map counts, each area's progress shown on its name once the area is filled in
  explorationAreas: ExplorationArea[];
  // The game's words in the reader's language
  gameText: GameText;
  landmarks: Landmark[];
  // The wallet, whose Original Resin the top bar counts as it regenerates to the moment the map opens
  // The server's clock minus this machine's, which the Original Resin's regeneration is read against
  serverClockOffsetMs?: number;
  wallet: Wallet;
}

const {
  camera,
  catalogue,
  explorationAreas,
  gameText,
  landmarks,
  serverClockOffsetMs = 0,
  wallet,
} = defineProps<Props>();
const emit = defineEmits<{ close: []; jump: [pose: WorldJumpPose] }>();

// The landmark chosen on the map or in the list, whose teleport panel names its area and jumps there on its Teleport
// Button alone, so a stray click on the map never teleports
const chosenLandmark = shallowRef<Landmark>();
const chosenArea = computed(() => chosenLandmark.value && findLandmarkArea(catalogue, chosenLandmark.value));
const chooseLandmark = (landmark: Landmark) => {
  chosenLandmark.value = landmark;
};
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
// Each counted area's progress line as the unlocked landmarks leave it, in the game's words and their colours, keyed by
// Its catalogue area: a fully explored area's percentage turns gold
const progressSegmentsMap = computed(
  () =>
    new Map(
      explorationAreas.map((area) => {
        const percentage = computeExplorationProgress(area, computeExploredDoingIds(area, landmarks));
        const text =
          gameText[percentage === 100 ? GameTextKey.ExplorationProgressComplete : GameTextKey.ExplorationProgress];
        return [area.areaId, splitGameTextColors(fillGameTextValues(text, percentage))];
      }),
    ),
);
const areaLabels = computed(() =>
  computeAreaLabels(catalogue, landmarks).map(({ id, name, x, z }) => ({
    id,
    name,
    progressSegments: progressSegmentsMap.value.get(id) ?? [],
    x,
    z,
  })),
);
// The area the character stands in, named at the bottom right with its progress line as the map names it
const regionTag = computed(() => {
  const area = findAreaAt(catalogue, camera.x, camera.z);
  return area && { name: area.name, progressSegments: progressSegmentsMap.value.get(area.id) ?? [] };
});
// The filled areas' progress, read out of the hidden drawing by a screen reader as a list of its own
const areaProgresses = computed(() => areaLabels.value.filter(({ progressSegments }) => progressSegments.length > 0));
const originalResin = computed(
  () =>
    regenerateOriginalResin(wallet, Temporal.Now.instant().add({ milliseconds: serverClockOffsetMs }))[
      Currency.OriginalResin
    ],
);
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
      <MapDrawing :catalogue :landmarks :mark-radius @select="chooseLandmark" />
      <template v-for="{ id, name, progressSegments, x, z } of areaLabels" :key="id">
        <text class="area-name" :font-size="metres * MAP_LABEL_SHARE" :x :y="z">
          {{ name }}
        </text>
        <text
          v-if="progressSegments.length > 0"
          class="area-progress"
          :font-size="metres * MAP_PROGRESS_SHARE"
          :x
          :y="z + metres * MAP_PROGRESS_OFFSET_SHARE"
        >
          <tspan v-for="({ color, text }, index) of progressSegments" :key="index" :fill="color">{{ text }}</tspan>
        </text>
      </template>
      <MapPointer :size="markRadius" :x="camera.x" :yaw="camera.yaw" :z="camera.z" />
    </svg>
    <svg
      ref="zoomTrack"
      class="zoom"
      viewBox="0 0 56 270"
      role="group"
      :aria-label="gameText[GameTextKey.Zoom]"
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
      <li v-for="{ id, name, progressSegments } of areaProgresses" :key="id">
        {{ name }} <span v-for="({ text }, index) of progressSegments" :key="index">{{ text }}</span>
      </li>
    </ul>
    <MapJumpList class="jumps" :catalogue :game-text :landmarks @jump="chooseLandmark" />
    <p v-if="regionTag" class="region-tag">
      <span class="region-name">{{ regionTag.name }}</span>
      <span v-if="regionTag.progressSegments.length > 0" class="region-progress">
        <span v-for="({ color, text }, index) of regionTag.progressSegments" :key="index" :style="{ color }">{{
          text
        }}</span>
      </span>
    </p>
    <p class="resin">
      <span>{{ gameText[GameTextKey.OriginalResin] }}</span>
      <span>{{ originalResin }}/{{ ORIGINAL_RESIN_CAP }}</span>
    </p>
    <section v-if="chosenLandmark" class="teleport-panel">
      <header class="teleport-header">
        <h2 class="teleport-title">{{ gameText[computeJumpLandmarkTextKey(chosenLandmark)] }}</h2>
        <button
          class="teleport-close"
          type="button"
          :aria-label="gameText[GameTextKey.Back]"
          @click="chosenLandmark = undefined"
        >
          <svg viewBox="-1 -1 2 2" aria-hidden="true">
            <path d="M -0.7 -0.7 L 0.7 0.7 M 0.7 -0.7 L -0.7 0.7" />
          </svg>
        </button>
      </header>
      <p class="teleport-place">{{ chosenArea?.name }} - {{ chosenArea?.subregion }}</p>
      <GameButton class="teleport" :kind="GameButtonKind.Pill" @click="emit('jump', computeJumpPose(chosenLandmark))">
        {{ gameText[GameTextKey.Teleport] }}
      </GameButton>
    </section>
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
  background: v-bind(MAP_GROUND);
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

/* The labels' white, read off the English map's ink over Galesong Hill, which draws them with no outline. Signika is
   Narrower than the game's face at one cap height, so each line keeps the game's cap height and is spaced out toward
   Its width (the name 252 pixels across, its line 278), at the spacing whose strokes score nearest the game's */
.area-name,
.area-progress {
  fill: #e5e9e0;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
}

.area-name {
  letter-spacing: 0.04em;
}

.area-progress {
  letter-spacing: 0.03em;
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

/* Provisional: the region tag's place, bottom right, and its sizes, measured off the captured PC waypoint clip's frame at
   1080 high (the name 134 units off the right edge and 51 off the bottom); its words are the client's own */
.region-tag {
  position: absolute;
  right: calc(var(--unit) * 134);
  bottom: calc(var(--unit) * 51);
  margin: 0;
  color: #ece5d7;
  text-align: end;
}

.region-name {
  display: block;
  font-size: calc(var(--unit) * 28);
}

.region-progress {
  display: block;
  font-size: calc(var(--unit) * 22);
}

/* Provisional: the teleport panel as the game's right-hand sidebar, measured off the captured PC waypoint clip
   (`captures/yt-Mhw53PsdhKI-waypoint.webm`, the Indonesian client): its header of 72 units, its place strip and its
   Teleport button 40 units off the bottom. The colours are estimated off that frame */
.teleport-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  width: calc(var(--unit) * 490);
  flex-direction: column;
  background: #efe9db;
  color: #3d4152;
}

.teleport-header {
  display: flex;
  height: calc(var(--unit) * 72);
  align-items: center;
  justify-content: space-between;
  padding: 0 calc(var(--unit) * 18) 0 calc(var(--unit) * 46);
  background: #3d4152;
  color: #f1e8cf;
}

.teleport-title {
  margin: 0;
  font-size: calc(var(--unit) * 30);
  font-weight: normal;
}

.teleport-close {
  display: grid;
  width: calc(var(--unit) * 36);
  height: calc(var(--unit) * 36);
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
}

.teleport-place {
  margin: calc(var(--unit) * 24) calc(var(--unit) * 14) 0;
  padding: calc(var(--unit) * 10) calc(var(--unit) * 16);
  border-radius: calc(var(--unit) * 4);
  background: #e0d4b6;
  font-size: calc(var(--unit) * 22);
}

.teleport {
  margin: auto calc(var(--unit) * 14) calc(var(--unit) * 40);
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
