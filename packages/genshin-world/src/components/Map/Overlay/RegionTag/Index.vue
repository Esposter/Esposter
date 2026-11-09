<script setup lang="ts">
import type { GameTextSegment } from "genshin-text";

interface Props {
  // The name of the city where the character stands, or else of its area
  name: string;
  // Its progress line as the map names it, each piece in the game's colour
  progressSegments: GameTextSegment[];
}

defineProps<Props>();
</script>

<template>
  <p class="region-tag">
    <span class="region-name">{{ name }}</span>
    <span v-if="progressSegments.length > 0" class="region-progress">
      <span v-for="({ color, text }, index) of progressSegments" :key="index" :style="{ color }">{{ text }}</span>
    </span>
  </p>
</template>

<style scoped>
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
</style>
