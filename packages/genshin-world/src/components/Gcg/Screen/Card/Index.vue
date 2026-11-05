<script setup lang="ts">
import type { GcgCost } from "#src/models/gcg/GcgCost";

import { countGcgDiceCost } from "#src/services/gcg/countGcgDiceCost";
import { INTERACTION_HOVER_DURATION, INTERACTION_REST_DURATION } from "genshin-interface";

interface Props {
  // The costs the card takes to play, whose dice its corner shows
  costs: GcgCost[];
  isSelected: boolean;
  // The card's name in the reader's language
  name: string;
}

const { costs, isSelected, name } = defineProps<Props>();
const emit = defineEmits<{ select: [] }>();
</script>

<template>
  <!-- A card of a side's hand, fanned along the bottom of the board by its hand's row, its dice cost in the corner. A
       chosen card lifts -->
  <button class="card" :aria-label="name" :class="{ selected: isSelected }" type="button" @click="emit('select')">
    <span class="cost">{{ countGcgDiceCost(costs) }}</span>
  </button>
</template>

<style scoped>
/* A card's frame is measured off the game's frame at 1080 high: its cream border, and its plate the mean of the hand's
   visible art down the card's top half. Its cost is the game's hexagon, and its name is only the button's label */
.card {
  --state-duration: v-bind(INTERACTION_REST_DURATION);
  position: relative;
  flex: none;
  width: calc(var(--unit) * 175);
  height: calc(var(--unit) * 200);
  padding: 0;
  border: calc(var(--unit) * 3) solid #ead7be;
  border-radius: calc(var(--unit) * 10);
  background: linear-gradient(#929b93, #9ba29a 25%, #c2c2b9 53%);
  box-shadow: 0 calc(var(--unit) * 2) calc(var(--unit) * 6) rgb(0 0 0 / 0.35);
  color: #fdf3f3;
  cursor: inherit;
  font: inherit;
  outline: calc(var(--unit) * 3) solid transparent;
  transition:
    outline-color var(--state-duration),
    filter var(--state-duration),
    transform 140ms;
}

/* Focused, or held in the forced Hover state, the card's cream frame lights gold, and a press dims it at once.
   A pointer's hover is guarded by `(hover: hover)`, so a touch screen leaves nothing lit after a tap */
@media (hover: hover) {
  .card:hover {
    --state-duration: v-bind(INTERACTION_HOVER_DURATION);
    outline-color: #f6e3a1;
  }
}

.card:is(:focus-visible, [data-interaction-state="Hover"] *) {
  --state-duration: v-bind(INTERACTION_HOVER_DURATION);
  outline-color: #f6e3a1;
}

.card:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) {
  --state-duration: 0s;
  filter: brightness(0.9);
}

.card.selected {
  transform: translateY(calc(var(--unit) * -30));
}

/* The cost hexagon stands 9 above the card's padding edge, so its top sits 6 above the card's top, as the frame draws it */
.cost {
  position: absolute;
  top: calc(var(--unit) * -9);
  left: 0;
  display: grid;
  width: calc(var(--unit) * 44);
  height: calc(var(--unit) * 50);
  place-items: center;
  clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
  background: #f5efe6;
  color: #403a15;
  font-size: calc(var(--unit) * 26);
  font-weight: 700;
}
</style>
