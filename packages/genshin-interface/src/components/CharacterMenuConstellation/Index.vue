<script setup lang="ts">
import { CONSTELLATION_NODE_PLACES } from "#src/services/constants";

interface Props {
  // Each of the character's six constellations in the order it takes them, true where it is activated
  activated: boolean[];
}

const { activated } = defineProps<Props>();
const nodeStyles = CONSTELLATION_NODE_PLACES.map(({ left, top }) => ({
  left: `calc(var(--unit) * ${left})`,
  top: `calc(var(--unit) * ${top})`,
}));
</script>

<template>
  <!-- The Constellation tab's panel: the six constellations down its right, each a ring lit once activated. The
       game's star map is its own art and its names are not decoded yet, so neither is drawn -->
  <div class="constellations">
    <ul class="nodes">
      <li
        v-for="(isActivated, index) in activated"
        :key="index"
        class="node"
        :class="{ lit: isActivated }"
        :style="nodeStyles[index]"
      />
    </ul>
  </div>
</template>

<style scoped>
/* Measured off the English PC client's Constellation tab at 21:9, its settled frame at 158.3 seconds of session-2.mp4
   (the star map's right-hand list), in units from the panel's top left: each ring is 72 units across, its gold border 4
   units wide with a 2-unit white band inside it, and the six are placed by CONSTELLATION_NODE_PLACES. Colours are provisional */
.constellations {
  position: absolute;
  inset: 0;
}

.nodes {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.node {
  position: absolute;
  box-sizing: border-box;
  width: calc(var(--unit) * 72);
  height: calc(var(--unit) * 72);
  border: calc(var(--unit) * 3) solid rgb(255 255 255 / 0.3);
  border-radius: 50%;
}

.node.lit {
  background: rgb(72 53 17);
  border: calc(var(--unit) * 4) solid #ffea00;
  box-shadow:
    inset 0 0 0 calc(var(--unit) * 2) #fff8dc,
    0 0 calc(var(--unit) * 6) rgb(255 180 40 / 0.6);
}
</style>
