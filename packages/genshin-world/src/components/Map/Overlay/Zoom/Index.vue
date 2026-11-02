<script setup lang="ts">
import type { GameText } from "genshin-text";

import { computeZoomMetresAtShare } from "#src/services/map/computeZoomMetresAtShare";
import { computeZoomShare } from "#src/services/map/computeZoomShare";
import { MAP_ZOOM_DRAWING_HEIGHT, MAP_ZOOM_TRACK_HEIGHT, MAP_ZOOM_TRACK_TOP } from "#src/services/map/constants";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
}

// The drawn metres across the map's width, which the slider sets and the map is drawn at
const metres = defineModel<number>("metres", { required: true });
const { gameText } = defineProps<Props>();
const zoomTrack = useTemplateRef("zoomTrack");
const zoomThumbY = computed(() => MAP_ZOOM_TRACK_TOP + computeZoomShare(metres.value) * MAP_ZOOM_TRACK_HEIGHT);
// Whether the slider is being dragged. It is not drawn, so it is a plain variable rather than state
let isSlidingZoom = false;
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
</script>

<template>
  <svg
    ref="zoomTrack"
    class="zoom"
    :viewBox="`0 0 56 ${MAP_ZOOM_DRAWING_HEIGHT}`"
    role="group"
    :aria-label="gameText[GameTextKey.Zoom]"
    @pointercancel="onZoomPointerUp()"
    @pointerdown="(event) => onZoomPointerDown(event)"
    @pointermove="(event) => onZoomPointerMove(event)"
    @pointerup="onZoomPointerUp()"
  >
    <rect class="zoom-track" x="23" :y="MAP_ZOOM_TRACK_TOP" width="10" :height="MAP_ZOOM_TRACK_HEIGHT" rx="5" />
    <path class="zoom-stop" d="M 28 16.5 L 39.5 28 L 28 39.5 L 16.5 28 Z" />
    <path class="zoom-sign" d="M 28 20 V 36 M 20 28 H 36" />
    <path class="zoom-stop" d="M 28 241.5 L 39.5 253 L 28 264.5 L 16.5 253 Z" />
    <path class="zoom-sign" d="M 20 253 H 36" />
    <g :transform="`translate(28 ${zoomThumbY})`">
      <path class="zoom-thumb" d="M 0 -12.5 L 12.5 0 L 0 12.5 L -12.5 0 Z" />
      <path class="zoom-star" d="M 0 -6 Q 0.9 -0.9 6 0 Q 0.9 0.9 0 6 Q -0.9 0.9 -6 0 Q -0.9 -0.9 0 -6 Z" />
    </g>
  </svg>
</template>

<style scoped>
/* The slider stands on the sea at the map's left edge, which the English map draws at this near-black, read off the frame
   beside the track */
.zoom {
  position: absolute;
  top: calc(var(--unit) * 400);
  left: 0;
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 270);
  background: #121721;
  touch-action: none;
}

.zoom-track {
  fill: #111317;
  stroke: rgb(255 255 255 / 0.35);
  stroke-width: 0.8;
}

/* The stops are diamonds outlined in cream over the track's dark, with a cream sign, as the reference draws them */
.zoom-stop {
  fill: #111317;
  stroke: #ede4e0;
  stroke-width: 4;
  stroke-linejoin: round;
}

/* The thumb is the cream diamond the stops were, with a dark four-pointed star, and stands where the zoom shows: at the
   reference's 1512 metres that is the middle of the track, so no stop is drawn there */
.zoom-thumb {
  fill: #ede4e0;
}

.zoom-star {
  fill: #4b5367;
}

.zoom-sign {
  fill: none;
  stroke: #ede4e0;
  stroke-width: 2.2;
  stroke-linecap: round;
}
</style>
