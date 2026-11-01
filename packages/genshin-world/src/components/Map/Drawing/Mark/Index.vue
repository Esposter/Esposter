<script setup lang="ts">
import type { Landmark } from "#src/models/world/Landmark";

interface Props {
  // The landmark the mark stands on, drawn at its place in the catalogue's metres
  landmark: Landmark;
  // How far the mark reaches from its point, in metres, so a mark is drawn one size at any view's scale
  markRadius: number;
}

const { landmark, markRadius } = defineProps<Props>();
const emit = defineEmits<{ select: [] }>();
</script>

<template>
  <circle class="mark" :cx="landmark.position.x" :cy="landmark.position.z" :r="markRadius" @click="emit('select')" />
</template>

<style scoped>
/* Provisional: the map's colours, measured off the game's map with the HUD's reference */
.mark {
  fill: rgb(96 178 196);
  stroke: #fff;
  stroke-width: 2;
  cursor: inherit;
  vector-effect: non-scaling-stroke;
}
</style>
