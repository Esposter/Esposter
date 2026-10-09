<script setup lang="ts">
import type { Catalogue } from "#src/models/world/Catalogue";
import type { Landmark } from "#src/models/world/Landmark";

import { computeFilledAreaIds } from "#src/services/map/computeFilledAreaIds";

interface Props {
  // The regions and their areas, whose drawn outlines the map fills in
  catalogue: Catalogue;
  // The landmarks the player has unlocked, which mark the map and fill in their areas
  landmarks: Landmark[];
  // How far a landmark's mark reaches from its point, in metres, so a mark is drawn one size at any view's scale
  markRadius: number;
}

const { catalogue, landmarks, markRadius } = defineProps<Props>();
const emit = defineEmits<{ select: [landmark: Landmark] }>();
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
       Landmarks a jump lands at, in world metres with x east and z south, so north is up -->
  <g>
    <polygon v-for="{ id, points } of areaOutlines" :key="id" class="area" :points />
    <circle
      v-for="landmark of landmarks"
      :key="landmark.id"
      class="mark"
      :cx="landmark.position.x"
      :cy="landmark.position.z"
      :r="markRadius"
      @click="emit('select', landmark)"
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

.mark {
  fill: rgb(96 178 196);
  stroke: #fff;
  stroke-width: 2;
  cursor: inherit;
  vector-effect: non-scaling-stroke;
}
</style>
