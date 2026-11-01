<script setup lang="ts">
import type { CharacterMenuEntry } from "#src/models/CharacterMenuEntry";

import { GAME_CREAM, INTERACTION_HOVER_MS, INTERACTION_REST_MS } from "#src/services/constants";

interface Props {
  // The characters either side of the chosen one, which the arrows at the frame's left and right edges step to
  next?: CharacterMenuEntry;
  previous?: CharacterMenuEntry;
}

const { next, previous } = defineProps<Props>();
const emit = defineEmits<{ step: [characterId: number] }>();
const hoverDuration = `${INTERACTION_HOVER_MS}ms`;
const restDuration = `${INTERACTION_REST_MS}ms`;
const steps = computed(() => [
  { character: previous, className: "previous" },
  { character: next, className: "next" },
]);
</script>

<template>
  <button
    v-for="{ character, className } of steps"
    :key="className"
    :class="['step', className]"
    :aria-label="character?.name"
    type="button"
    @click="character && emit('step', character.id)"
  >
    <!-- The arrow's head and the diamond in its notch, in the reference's own pixels -->
    <svg viewBox="0 0 43 55" aria-hidden="true">
      <path class="arrow" d="M31 0 L0 27.5 L31 55 L31 42 L16 27.5 L31 13 Z" />
      <path class="mark" d="M31 16.5 L42 27.5 L31 38.5 L20 27.5 Z M31 22 L25.5 27.5 L31 33 L36.5 27.5 Z" />
      <path class="mark" d="M31 25.5 L33 27.5 L31 29.5 L29 27.5 Z" />
    </svg>
  </button>
</template>

<style scoped>
/* The arrows stepping to the characters either side, centred down the frame's left and right edges, their heads 129.75
   units from the edge and their backs 153.75 */
.step {
  --state-duration: v-bind(restDuration);
  position: absolute;
  top: calc(50% - var(--unit) * 21);
  width: calc(var(--unit) * 32.25);
  height: calc(var(--unit) * 41.25);
  padding: 0;
  border: none;
  background: transparent;
  cursor: inherit;
  transition: filter var(--state-duration);
}

.step:is(:focus-visible, [data-interaction-state="Hover"] *) {
  --state-duration: v-bind(hoverDuration);
  filter: brightness(1.2);
}

@media (hover: hover) {
  .step:hover {
    --state-duration: v-bind(hoverDuration);
    filter: brightness(1.2);
  }
}

.step:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) {
  --state-duration: 0s;
  filter: brightness(0.9);
}

.step svg {
  display: block;
  width: 100%;
  height: 100%;
}

.previous {
  left: calc(var(--unit) * 129.75);
}

.next {
  right: calc(var(--unit) * 129.75);
  transform: scaleX(-1);
}

.arrow {
  fill: v-bind(GAME_CREAM);
}

.mark {
  fill: rgb(236 229 216 / 0.5);
}
</style>
