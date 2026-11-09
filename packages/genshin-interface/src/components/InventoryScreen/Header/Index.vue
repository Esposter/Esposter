<script setup lang="ts">
import type { ItemCategory } from "#src/models/ItemCategory";

import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";
import { ItemCategories } from "#src/models/ItemCategory";
import { GAME_REPLY_HOVER_INK } from "#src/services/constants";
import { ItemCategoryGlyphMap } from "#src/services/ItemCategoryGlyphMap";

interface Props {
  // The way back to the world in the reader's language
  backLabel: string;
  // The open tab's room as the game words it, "" for a tab whose items share the bag's room
  capacity: string;
  tabLabels: Record<ItemCategory, string>;
}

const category = defineModel<ItemCategory>("category", { required: true });
defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <!-- The head bar: the tabs across it in the game's order, the open tab's room beside the way back -->
  <ul class="tabs">
    <li v-for="itemCategory of ItemCategories" :key="itemCategory">
      <GameButton
        class="tab"
        :aria-label="tabLabels[itemCategory]"
        :aria-pressed="itemCategory === category"
        :data-category="itemCategory"
        :kind="GameButtonKind.Row"
        tip=""
        @click="category = itemCategory"
      >
        <svg v-if="ItemCategoryGlyphMap[itemCategory]" viewBox="0 0 144 144" aria-hidden="true">
          <path :d="ItemCategoryGlyphMap[itemCategory]" />
        </svg>
      </GameButton>
    </li>
  </ul>
  <p class="capacity">{{ capacity }}</p>
  <GameButton class="back" :aria-label="backLabel" :kind="GameButtonKind.Row" tip="" @click="emit('close')">
    <svg class="back-glyph" viewBox="0 0 56 56" aria-hidden="true">
      <path d="M19.5 19.5 36.5 36.5M36.5 19.5 19.5 36.5" />
    </svg>
  </GameButton>
</template>

<style scoped>
.tabs {
  position: absolute;
  top: calc(var(--unit) * 22);
  left: calc(var(--unit) * 559);
  display: flex;
  gap: calc(var(--unit) * 56);
  margin: 0;
  padding: 0;
  list-style: none;
}

.tab {
  position: relative;
  width: calc(var(--unit) * 40);
  height: calc(var(--unit) * 40);
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.3);
}

/* A traced tab shows its icon in place of the disc, the 48 units its trace was cut at centred on the disc */
.tab:has(svg) {
  background: none;
}

.tab svg {
  position: absolute;
  top: calc(var(--unit) * -4);
  left: calc(var(--unit) * -4);
  width: calc(var(--unit) * 48);
  height: calc(var(--unit) * 48);
  fill: rgb(180 176 172);
}

.tab[aria-pressed="true"] {
  background: #ece3d8;
}

.capacity {
  position: absolute;
  top: calc(var(--unit) * 28);
  right: calc(var(--unit) * 115);
  margin: 0;
  color: #d8cdaa;
  font-size: calc(var(--unit) * 23);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1);
}

.back {
  position: absolute;
  top: calc(var(--unit) * 14);
  left: calc(var(--unit) * 1824);
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #ece3d8;
}

/* The way back's cross, two round-ended bars of 28 units at 45 degrees, drawn as strokes so the button's own lit look
   does not take the bars' pseudo-elements */
.back-glyph {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  fill: none;
  stroke: v-bind(GAME_REPLY_HOVER_INK);
  stroke-linecap: round;
  stroke-width: 4;
}
</style>
