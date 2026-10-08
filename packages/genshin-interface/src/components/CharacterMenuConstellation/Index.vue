<script setup lang="ts">
interface Props {
  // Each of the character's six constellations in the order it takes them, true where it is activated
  activated: boolean[];
}

const { activated } = defineProps<Props>();
</script>

<template>
  <!-- The Constellation tab's panel: the six constellations down its right, each a ring lit once activated. The
       game's star map is its own art and its names are not decoded yet, so neither is drawn -->
  <div class="constellations">
    <ul class="nodes">
      <li v-for="(isActivated, index) in activated" :key="index" class="node" :class="{ lit: isActivated }" />
    </ul>
  </div>
</template>

<style scoped>
/* Measured off the English PC client's Constellation tab at 21:9, its settled frame at 158 seconds of session-2.mp4 (the
   star map's right-hand list), in units from the panel's top: the rings sit 110 units apart from a centre 151 units
   down, each 52 units across and centred 58 units from the panel's left. Colours are provisional */
.constellations {
  position: absolute;
  inset: 0;
  color: #fff;
}

.nodes {
  position: absolute;
  top: calc(var(--unit) * 125);
  left: calc(var(--unit) * 32);
  margin: 0;
  padding: 0;
  list-style: none;
}

.node {
  width: calc(var(--unit) * 52);
  height: calc(var(--unit) * 52);
  margin-bottom: calc(var(--unit) * 58);
  border: calc(var(--unit) * 3) solid rgb(255 255 255 / 0.3);
  border-radius: 50%;
}

.node.lit {
  border-color: #f5c542;
  box-shadow: 0 0 calc(var(--unit) * 8) #f5c542;
}
</style>
