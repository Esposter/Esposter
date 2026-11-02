<script setup lang="ts">
import type { SettingsOption } from "#src/models/menu/SettingsOption";

import {
  GAME_ROW_HOVER,
  GAME_ROW_PRESS,
  INTERACTION_HOVER_DURATION,
  INTERACTION_REST_DURATION,
} from "genshin-interface";

interface Props {
  // The label of the row the list opens under, which names the list
  label: string;
  // The options the open list offers, each with whether it is the setting now and the choice that sets it
  options: SettingsOption[];
}

const { label, options } = defineProps<Props>();
</script>

<template>
  <div class="options" role="listbox" :aria-label="label">
    <button
      v-for="option of options"
      :key="option.label"
      class="option row-tint"
      role="option"
      type="button"
      :aria-selected="option.isSelected"
      @click="option.choose()"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped src="genshin-interface/styles/rowTint.css"></style>

<style scoped>
/* The list an open row shows under it, each option a row's glass and the chosen one a tan panel. Provisional: the list's
   Place and the chosen option's colour, which the clip shows only with the list closed */
.options {
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 8);
}

/* Provisional: an option is lit as a row is, a tint over its box behind its words (`rowTint.css`), hovered or
   Focused, and pressed at once. The chosen option keeps its own tan, which the tint does not hold */
.option {
  --row-press: v-bind(GAME_ROW_PRESS);
  --row-tint: v-bind(GAME_ROW_HOVER);
  --state-duration: v-bind(INTERACTION_REST_DURATION);
  position: relative;
  height: calc(var(--unit) * 56);
  padding: 0 calc(var(--unit) * 29);
  border: none;
  border-radius: calc(var(--unit) * 28);
  background: rgb(239 231 221 / 0.78);
  color: #4b4d54;
  cursor: pointer;
  font: inherit;
  font-size: calc(var(--unit) * 27);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1);
  text-align: start;
}

.option:enabled:is(:focus-visible, [data-interaction-state="Hover"] *) {
  --state-duration: v-bind(INTERACTION_HOVER_DURATION);
}

@media (hover: hover) {
  .option:enabled:hover {
    --state-duration: v-bind(INTERACTION_HOVER_DURATION);
  }
}

.option:enabled:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) {
  --state-duration: 0s;
}

.option[aria-selected="true"] {
  background: rgb(216 203 183 / 0.86);
}
</style>
