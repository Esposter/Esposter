<script setup lang="ts">
import type { ItemCategory } from "#src/models/ItemCategory";

import { ItemCategories } from "#src/models/ItemCategory";
import { ItemCategoryGlyphMap } from "#src/services/ItemCategoryGlyphMap";

interface Props {
  // The way back to the world in the reader's language
  backLabel: string;
  // The open tab's room as the game words it, "" for a tab whose items share the bag's room
  capacity: string;
  tabLabels: Record<ItemCategory, string>;
}

const category = defineModel<ItemCategory>("category", { required: true });
const { backLabel, capacity, tabLabels } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <!-- The head bar: the tabs across it in the game's order, the open tab's room beside the way back -->
  <ul class="tabs">
    <li v-for="itemCategory of ItemCategories" :key="itemCategory">
      <button
        class="tab"
        :aria-label="tabLabels[itemCategory]"
        :aria-pressed="itemCategory === category"
        :data-category="itemCategory"
        type="button"
        @click="category = itemCategory"
      >
        <svg v-if="ItemCategoryGlyphMap[itemCategory]" viewBox="0 0 144 144" aria-hidden="true">
          <path :d="ItemCategoryGlyphMap[itemCategory]" />
        </svg>
      </button>
    </li>
  </ul>
  <p class="capacity">{{ capacity }}</p>
  <button class="back" :aria-label="backLabel" type="button" @click="emit('close')" />
</template>

<style scoped>
.tabs {
  margin: 0;
  padding: 0;
  list-style: none;
}

.tabs {
  position: absolute;
  top: calc(var(--unit) * 22);
  left: calc(var(--unit) * 559);
  display: flex;
  gap: calc(var(--unit) * 56);
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

.back::before,
.back::after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--unit) * 28);
  height: calc(var(--unit) * 4);
  border-radius: calc(var(--unit) * 2);
  background: #3b4255;
  content: "";
  transform: translate(-50%, -50%) rotate(45deg);
}

.back::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}
</style>
