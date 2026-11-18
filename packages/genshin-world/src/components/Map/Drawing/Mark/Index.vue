<script setup lang="ts">
import type { PlaceLandmark } from "#src/models/world/PlaceLandmark";

import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { MAP_MARK_RADIUS_PIXELS, MAP_PIN_CENTRE } from "#src/services/map/constants";
import { MapPinPathMap } from "#src/services/map/MapPinPathMap";
import { GAME_CREAM, INTERACTION_HOVER_DURATION, INTERACTION_REST_DURATION } from "genshin-interface/constants";

interface Props {
  // The landmark the mark stands on, drawn at its place in the catalogue's metres
  landmark: PlaceLandmark;
  // How far the mark reaches from its point, in metres, so a mark is drawn one size at any view's scale
  markRadius: number;
}

const { landmark, markRadius } = defineProps<Props>();
const emit = defineEmits<{ select: [] }>();
// A class with a traced pin is drawn as that pin, its box's centre on the landmark's place and its pixels at the mark's scale
const pinPath = computed(() => MapPinPathMap[landmark.kind]);
const pinTransform = computed(
  () =>
    `translate(${landmark.position.x} ${landmark.position.z}) scale(${markRadius / MAP_MARK_RADIUS_PIXELS}) translate(${-MAP_PIN_CENTRE.x} ${-MAP_PIN_CENTRE.y})`,
);
</script>

<template>
  <path
    v-if="pinPath"
    :class="['mark', 'mark-pin', { 'mark-statue': landmark.kind === LandmarkKind.StatueOfTheSeven }]"
    fill-rule="evenodd"
    :d="pinPath"
    :transform="pinTransform"
    @click="emit('select')"
  />
  <circle
    v-else
    class="mark"
    :cx="landmark.position.x"
    :cy="landmark.position.z"
    :r="markRadius"
    @click="emit('select')"
  />
</template>

<style scoped>
/* Provisional: the map's colours, measured off the game's map with the HUD's reference. Hovered, the fill lightens toward
   white, and pressed it turns cream as a Disc's press does: no recording shows a mark lit. A mark is a drawing in the
   map's own SVG, so it takes no keyboard focus; the map's jump list is its keyboard route */
.mark {
  fill: rgb(96 178 196);
  stroke: #fff;
  stroke-width: 2;
  cursor: inherit;
  transition: fill v-bind(INTERACTION_REST_DURATION);
  vector-effect: non-scaling-stroke;
}

/* A traced waypoint is white, as the reference draws it, and a statue is the dark slate its reference draws round its orb */
.mark-pin {
  fill: #fff;
}

.mark-statue {
  fill: rgb(60 64 74);
}

@media (hover: hover) {
  .mark:hover {
    fill: color-mix(in srgb, rgb(96 178 196) 60%, #fff);
    transition-duration: v-bind(INTERACTION_HOVER_DURATION);
  }
}

.mark:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) {
  fill: v-bind(GAME_CREAM);
  transition-duration: 0s;
}
</style>
