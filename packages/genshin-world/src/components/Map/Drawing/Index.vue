<script setup lang="ts">
import type { Catalogue } from "#src/models/world/Catalogue";
import type { PlaceLandmark } from "#src/models/world/PlaceLandmark";

import MapDrawingMark from "#src/components/Map/Drawing/Mark/Index.vue";
import { computeFilledAreaIds } from "#src/services/map/computeFilledAreaIds";

interface Props {
  // The regions and their areas, whose drawn outlines the map fills in
  catalogue: Catalogue;
  // The landmarks the player has unlocked, which mark the map and fill in their areas
  landmarks: PlaceLandmark[];
  // How far a landmark's mark reaches from its point, in metres, so a mark is drawn one size at any view's scale
  markRadius: number;
  // The SVG transform that turns the catalogue's points into the view's frame, which the overlay gives: `""` for the
  // Minimap, whose own group only translates the drawing
  transform: string;
}

const { catalogue, landmarks } = defineProps<Props>();
const emit = defineEmits<{ select: [landmark: PlaceLandmark] }>();
// Only a filled area's outline is drawn: the rest of the map is blank until a statue of it is resonated with
const areaOutlines = computed(() => {
  const filledAreaIds = computeFilledAreaIds(landmarks);
  return catalogue.regions.flatMap(({ areas }) =>
    areas
      .filter(({ id, outline }) => outline.length > 0 && filledAreaIds.has(id))
      .map(({ id, outline }) => ({ id, points: outline.map(({ x, z }) => `${x},${z}`).join(" ") })),
  );
});
</script>

<template>
  <!-- The map's one drawing, which the overlay and the minimap each view: the catalogue's drawn outlines and the
       landmarks a jump lands at, in the catalogue's metres, turned into the view's frame by the transform it is given -->
  <g :transform>
    <polygon v-for="{ id, points } of areaOutlines" :key="id" class="area" :points />
    <MapDrawingMark
      v-for="landmark of landmarks"
      :key="landmark.id"
      :landmark
      :mark-radius
      @select="emit('select', landmark)"
    />
  </g>
</template>

<style scoped>
/* Provisional: the map's colours, measured off the game's map with the HUD's reference */
.area {
  fill: rgb(214 201 168 / 0.85);
  stroke: rgb(120 104 74);
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}
</style>
