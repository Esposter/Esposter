<script setup lang="ts">
import type { GcgCost } from "#src/models/gcg/GcgCost";

import { countGcgDiceCost } from "#src/services/gcg/countGcgDiceCost";
import { INTERACTION_HOVER_MS, INTERACTION_REST_MS } from "genshin-interface";

interface Props {
  // The costs the skill takes to use, whose dice its token shows
  costs: GcgCost[];
  // Whether the skill cannot be used at this moment
  isDisabled: boolean;
}

const { costs, isDisabled } = defineProps<Props>();
const emit = defineEmits<{ select: [] }>();
const hoverDuration = `${INTERACTION_HOVER_MS}ms`;
const restDuration = `${INTERACTION_REST_MS}ms`;
</script>

<template>
  <!-- A skill coin of the active character, its dice cost in a token beneath it -->
  <button class="skill" :disabled="isDisabled" type="button" @click="emit('select')">
    <span class="skill-cost">{{ countGcgDiceCost(costs) }}</span>
  </button>
</template>

<style scoped>
.skill {
  --state-duration: v-bind(restDuration);
  position: relative;
  width: calc(var(--unit) * 94);
  height: calc(var(--unit) * 94);
  border: calc(var(--unit) * 4) solid #6e5238;
  border-radius: 50%;
  background: #8e7154;
  color: #f6e3a1;
  cursor: inherit;
  outline: calc(var(--unit) * 1) solid transparent;
  transition:
    filter var(--state-duration),
    outline-color var(--state-duration);
}

/* A usable coin lights a white ring when focused or held in the forced Hover state, and a press dims it at once,
   A spent one staying as it is. The shared ring sheet has no `:enabled`, so a spent coin keeps its own ring rules.
   A pointer's hover is guarded by `(hover: hover)`, so a touch screen leaves nothing lit after a tap */
@media (hover: hover) {
  .skill:enabled:hover {
    --state-duration: v-bind(hoverDuration);
    outline-color: #fff;
  }
}

.skill:enabled:is(:focus-visible, [data-interaction-state="Hover"] *) {
  --state-duration: v-bind(hoverDuration);
  outline-color: #fff;
}

.skill:enabled:is(:active, [data-interaction-state="Pressed"] *) {
  --state-duration: 0s;
  filter: brightness(0.9);
}

.skill-cost {
  position: absolute;
  top: calc(var(--unit) * 104);
  left: 50%;
  display: grid;
  width: calc(var(--unit) * 30);
  height: calc(var(--unit) * 30);
  place-items: center;
  transform: translateX(-50%);
  border-radius: calc(var(--unit) * 6);
  background: #7b5bb0;
  color: #fff;
  font-size: calc(var(--unit) * 20);
  font-weight: 700;
}
</style>
