<script setup lang="ts">
import type { VNode } from "vue";

import { GAME_ROW_HOVER, GAME_ROW_PRESS, INTERACTION_HOVER_MS, INTERACTION_REST_MS } from "genshin-interface";

defineSlots<{ default: () => VNode }>();
const hoverDuration = `${INTERACTION_HOVER_MS}ms`;
const restDuration = `${INTERACTION_REST_MS}ms`;
</script>

<template>
  <button class="tab row-tint" role="tab" type="button">
    <slot />
  </button>
</template>

<style scoped src="genshin-interface/styles/rowTint.css"></style>

<style scoped>
.tab {
  --row-press: v-bind(GAME_ROW_PRESS);
  --row-tint: v-bind(GAME_ROW_HOVER);
  --state-duration: v-bind(restDuration);
  position: relative;
  display: flex;
  height: calc(var(--unit) * 76);
  margin: 0;
  margin-bottom: calc(var(--unit) * 13);
  padding: calc(var(--unit) * 14) calc(var(--unit) * 30) 0;
  border: none;
  background: rgb(40 50 70 / 0.72);
  color: inherit;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 24);
  font-weight: 600;
  justify-content: space-between;
  text-align: start;
}

/* Provisional: the game draws no state for a tab's own box, so it is lit as a row is, by the `rowTint.css` sheet
   This tab wears. No reference frame shows either state */
@media (hover: hover) {
  .tab:enabled:hover {
    --state-duration: v-bind(hoverDuration);
  }
}

.tab:enabled:is(:focus-visible, [data-interaction-state="Hover"] *) {
  --state-duration: v-bind(hoverDuration);
}

.tab:enabled:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) {
  --state-duration: 0s;
}

.tab[aria-selected="true"] {
  outline: calc(var(--unit) * 2) solid #d3bc8e;
}
</style>
