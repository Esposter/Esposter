<script setup lang="ts">
import type { AchievementCategory } from "#src/models/achievement/AchievementCategory";

import { GAME_ROW_HOVER, GAME_ROW_PRESS } from "genshin-interface";

interface Props {
  // The category the row names, which the list selects when the row is pressed
  category: AchievementCategory;
  // Whether the row is the category the list shows, which marks it as selected
  isSelected: boolean;
  // The share of the category's achievements that are finished, read once for the list and the banner
  percent: number;
  // The achievements' and categories' words in the reader's language, by the game's text id
  textMap: Readonly<Record<string, string>>;
}

const { category, isSelected, percent, textMap } = defineProps<Props>();
const emit = defineEmits<{ select: [] }>();
</script>

<template>
  <button class="category" role="tab" type="button" :aria-selected="isSelected" @click="emit('select')">
    <span class="badge" />
    <span class="name">{{ textMap[category.nameTextId] }}</span>
    <span class="percent">{{ percent }} %</span>
  </button>
</template>

<style scoped>
.category {
  position: relative;
  flex: none;
  box-sizing: border-box;
  width: calc(var(--unit) * 534);
  height: calc(var(--unit) * 83);
  margin: 0;
  padding: 0;
  border: none;
  background: #353f4e;
  color: #ebe7dc;
  font: inherit;
  text-align: left;
  cursor: inherit;
}

/* Lit as a row is, a tint over its own box behind its words, the selected one too: on a pointer's hover only, so a tap
   leaves none, and on focus or the forced hover; pressed at once. Provisional, as no recording shows a category under the
   pointer */
@media (hover: hover) {
  .category:enabled:hover {
    background-image: linear-gradient(v-bind(GAME_ROW_HOVER), v-bind(GAME_ROW_HOVER));
  }
}

.category:enabled:is(:focus-visible, [data-interaction-state="Hover"] *) {
  background-image: linear-gradient(v-bind(GAME_ROW_HOVER), v-bind(GAME_ROW_HOVER));
}

.category:enabled:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) {
  background-image: linear-gradient(v-bind(GAME_ROW_PRESS), v-bind(GAME_ROW_PRESS));
}

.category[aria-selected="true"] {
  width: calc(var(--unit) * 556);
  margin-left: calc(var(--unit) * -11);
  outline: calc(var(--unit) * 2) solid #fff;
  outline-offset: 0;
  background: #eae2d3;
  color: #2e2a24;
}

.category[aria-selected="true"]::before {
  position: absolute;
  top: calc(50% - var(--unit) * 6);
  left: calc(var(--unit) * -11);
  width: 0;
  height: 0;
  border-top: calc(var(--unit) * 6) solid transparent;
  border-bottom: calc(var(--unit) * 6) solid transparent;
  border-left: calc(var(--unit) * 8) solid #fff;
  content: "";
}

.badge {
  position: absolute;
  top: calc(var(--unit) * 14);
  left: calc(var(--unit) * 18);
  width: calc(var(--unit) * 28);
  height: calc(var(--unit) * 32);
  background: #938a76;
}

.name {
  position: absolute;
  top: calc(var(--unit) * 14);
  left: calc(var(--unit) * 65);
  font-size: calc(var(--unit) * 24);
  line-height: calc(var(--unit) * 28);
  white-space: nowrap;
}

.percent {
  position: absolute;
  top: calc(var(--unit) * 46);
  left: calc(var(--unit) * 65);
  color: #cfcac0;
  font-size: calc(var(--unit) * 20);
  line-height: calc(var(--unit) * 22);
}

.category[aria-selected="true"] .percent {
  color: #3a342a;
}
</style>
