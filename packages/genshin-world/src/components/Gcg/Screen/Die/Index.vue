<script setup lang="ts">
import type { Element } from "#src/models/Element";
import type { GcgDieFace } from "#src/models/gcg/GcgDieFace";

interface Props {
  // The face the die shows: one of the seven elements, or Omni
  face: Element | GcgDieFace;
  isSelected?: boolean;
}

const { face, isSelected } = defineProps<Props>();
const emit = defineEmits<{ select: [] }>();
</script>

<template>
  <!-- A die of a side's dice: a disc in its element's colour, lifted and ringed while it is chosen to be paid or rerolled -->
  <button class="die" :class="{ selected: isSelected }" :data-face="face" type="button" @click="emit('select')" />
</template>

<style scoped>
/* Provisional: a die's colours and size wait on the parity pass, as the board's do */
.die {
  width: calc(var(--unit) * 40);
  height: calc(var(--unit) * 40);
  padding: 0;
  border: calc(var(--unit) * 3) solid rgb(255 255 255 / 0.8);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, rgb(255 255 255 / 0.55), var(--die-color) 60%);
  box-shadow: 0 calc(var(--unit) * 2) calc(var(--unit) * 4) rgb(0 0 0 / 0.4);
  cursor: inherit;
  transition: transform 120ms;
}

.die.selected {
  transform: translateX(calc(var(--unit) * -8));
  border-color: #f6e3a1;
}

.die[data-face="Pyro"],
.die[data-face="Fire"] {
  --die-color: #e0532c;
}

.die[data-face="Hydro"],
.die[data-face="Water"] {
  --die-color: #3b86d6;
}

.die[data-face="Anemo"],
.die[data-face="Wind"] {
  --die-color: #47c9a8;
}

.die[data-face="Electro"],
.die[data-face="Electric"] {
  --die-color: #9a62d8;
}

.die[data-face="Dendro"],
.die[data-face="Grass"] {
  --die-color: #8cc640;
}

.die[data-face="Cryo"],
.die[data-face="Ice"] {
  --die-color: #8fd8f2;
}

.die[data-face="Geo"],
.die[data-face="Rock"] {
  --die-color: #d9a441;
}

.die[data-face="Omni"] {
  --die-color: #f0e2b0;
}
</style>
