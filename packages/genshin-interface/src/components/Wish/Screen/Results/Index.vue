<script setup lang="ts">
import type { WishResultCell } from "#src/models/WishResultCell";

import RarityStars from "#src/components/RarityStars/Index.vue";
import { GAME_CREAM, INTERACTION_HOVER_DURATION, INTERACTION_REST_DURATION } from "#src/services/constants";

interface Props {
  // What the last wishes drew, one card each in the order the game shows them, over the screen until a click goes on
  results: WishResultCell[];
}

const { results } = defineProps<Props>();
const emit = defineEmits<{ dismiss: [] }>();
</script>

<template>
  <button class="results" type="button" @click="emit('dismiss')">
    <span class="result-list">
      <span
        v-for="({ name, rarity, stellaFortuna, wishReturn }, index) of results"
        :key="index"
        class="result"
        :data-rarity="rarity"
      >
        <span class="result-name">{{ name }}</span>
        <RarityStars color="" :rarity />
        <span v-if="stellaFortuna" class="result-stella-fortuna">{{ stellaFortuna }}</span>
        <span class="result-return">{{ wishReturn }}</span>
      </span>
    </span>
  </button>
</template>

<style scoped>
.results {
  --state-duration: v-bind(INTERACTION_REST_DURATION);
  position: absolute;
  inset: 0;
  display: grid;
  border: none;
  padding: 0;
  background: rgb(255 255 255 / 0.92);
  color: inherit;
  cursor: inherit;
  font: inherit;
  place-items: center;
}

/* The overlay is one click that goes on, so hovering or focusing it lights its results together, and a press
   dims them at once */
.results:is(:focus-visible, [data-interaction-state="Hover"] *) {
  --state-duration: v-bind(INTERACTION_HOVER_DURATION);
}

.results:is(:focus-visible, [data-interaction-state="Hover"] *) .result {
  filter: brightness(1.1);
}

@media (hover: hover) {
  .results:hover {
    --state-duration: v-bind(INTERACTION_HOVER_DURATION);
  }

  .results:hover .result {
    filter: brightness(1.1);
  }
}

.results:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) {
  --state-duration: 0s;
}

.results:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) .result {
  filter: brightness(0.9);
}

.result-list {
  display: flex;
  gap: calc(var(--unit) * 12);
  margin: 0;
  padding: 0;
  list-style: none;
}

.result {
  display: flex;
  width: calc(var(--unit) * 120);
  height: calc(var(--unit) * 420);
  flex-direction: column;
  justify-content: end;
  border-radius: calc(var(--unit) * 8);
  background: #5180b6;
  color: v-bind(GAME_CREAM);
  font-size: calc(var(--unit) * 18);
  text-align: center;
  transition: filter var(--state-duration);
}

.result[data-rarity="4"] {
  background: #8d6fb5;
}

.result[data-rarity="5"] {
  background: #c18b4c;
}

.result-stella-fortuna {
  font-size: calc(var(--unit) * 14);
}

.result-return {
  padding-bottom: calc(var(--unit) * 8);
  font-size: calc(var(--unit) * 14);
}
</style>
