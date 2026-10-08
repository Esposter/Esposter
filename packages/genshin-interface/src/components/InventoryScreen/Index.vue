<script setup lang="ts">
import type { CurrencyCount } from "#src/models/CurrencyCount";
import type { InventoryCell } from "#src/models/InventoryCell";
import type { InventorySort } from "#src/models/InventorySort";
import type { ItemCategory } from "#src/models/ItemCategory";

import { InventorySorts } from "#src/models/InventorySort";
import { ItemCategories } from "#src/models/ItemCategory";

interface Props {
  // The way back to the world in the reader's language
  backLabel: string;
  // The open tab's room as the game words it, "" for a tab whose items share the bag's room
  capacity: string;
  // The open tab's entries in the order the game shows them
  cells: InventoryCell[];
  // The counts the bag shows beside its tabs
  currencies: CurrencyCount[];
  // Whether the open tab offers the sort, as the weapons' and artifacts' do
  isSortable?: true;
  // The sort's order in the reader's language, which a screen reader says in place of its arrow
  orderLabel: string;
  sortLabels: Record<InventorySort, string>;
  tabLabels: Record<ItemCategory, string>;
  title: string;
}

const category = defineModel<ItemCategory>("category", { required: true });
const sort = defineModel<InventorySort>("sort", { required: true });
const isDescending = defineModel<boolean>("isDescending", { required: true });
const { backLabel, capacity, cells, currencies, isSortable, orderLabel, sortLabels, tabLabels, title } =
  defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <!-- The bag, the B key's: its tabs across the head in the game's order with the counts and the way back beside them,
       The open tab's room and sort, and its grid of entries, each with its count or level under it. Provisional: every
       Place, size and colour here, and the tabs' and items' icons, wait on the inventory's passes against a recording
       Of the English client at 1080 high -->
  <div class="inventory-screen">
    <header class="head">
      <p class="title" role="heading" aria-level="1">{{ title }}</p>
      <ul class="tabs">
        <li v-for="itemCategory of ItemCategories" :key="itemCategory">
          <button class="tab" :aria-pressed="itemCategory === category" type="button" @click="category = itemCategory">
            {{ tabLabels[itemCategory] }}
          </button>
        </li>
      </ul>
      <ul class="currencies">
        <li v-for="{ id, name, quantity } of currencies" :key="id" class="currency">
          <span class="currency-name">{{ name }}</span>
          {{ quantity }}
        </li>
      </ul>
      <button class="back" type="button" @click="emit('close')">{{ backLabel }}</button>
    </header>
    <div class="bar">
      <p class="capacity">{{ capacity }}</p>
      <div v-if="isSortable" class="sort" role="group">
        <button
          v-for="inventorySort of InventorySorts"
          :key="inventorySort"
          class="sort-choice"
          :aria-pressed="inventorySort === sort"
          type="button"
          @click="sort = inventorySort"
        >
          {{ sortLabels[inventorySort] }}
        </button>
        <button
          class="order"
          :aria-label="orderLabel"
          :data-descending="isDescending"
          type="button"
          @click="isDescending = !isDescending"
        />
      </div>
    </div>
    <ul class="grid">
      <li
        v-for="{ caption, id, name, rarity } of cells"
        :key="id"
        class="cell"
        :aria-label="name"
        :data-rarity="rarity"
      >
        <span class="caption">{{ caption }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.inventory-screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 16);
  padding: calc(var(--unit) * 24) calc(var(--unit) * 48);
  box-sizing: border-box;
  background: rgb(28 32 42 / 0.92);
  color: #ece5d8;
}

.head,
.bar {
  display: flex;
  align-items: center;
  gap: calc(var(--unit) * 24);
}

.title {
  margin: 0;
  font-size: calc(var(--unit) * 32);
}

.tabs,
.currencies,
.grid {
  margin: 0;
  padding: 0;
  list-style: none;
}

.tabs {
  display: flex;
  flex: 1;
  justify-content: center;
  gap: calc(var(--unit) * 8);
}

.tab,
.back,
.sort-choice,
.order {
  padding: calc(var(--unit) * 8) calc(var(--unit) * 14);
  border: none;
  border-radius: calc(var(--unit) * 24);
  background: rgb(255 255 255 / 0.08);
  color: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 18);
}

.tab[aria-pressed="true"],
.sort-choice[aria-pressed="true"] {
  background: #ece5d8;
  color: #3b4255;
}

.currencies {
  display: flex;
  gap: calc(var(--unit) * 16);
  font-size: calc(var(--unit) * 20);
}

.currency-name {
  opacity: 0.7;
}

.capacity {
  flex: 1;
  margin: 0;
  font-size: calc(var(--unit) * 22);
}

.sort {
  display: flex;
  gap: calc(var(--unit) * 8);
}

.order {
  width: calc(var(--unit) * 40);
}

.order::before {
  content: "\2191";
}

.order[data-descending="true"]::before {
  content: "\2193";
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, calc(var(--unit) * 124));
  grid-auto-rows: calc(var(--unit) * 152);
  gap: calc(var(--unit) * 14);
  overflow-y: auto;
}

.cell {
  display: flex;
  align-items: end;
  border-radius: calc(var(--unit) * 8);
  background: #6e7181;
}

.cell[data-rarity="2"] {
  background: #4f8c6d;
}

.cell[data-rarity="3"] {
  background: #5180b6;
}

.cell[data-rarity="4"] {
  background: #8d6fb5;
}

.cell[data-rarity="5"] {
  background: #c18b4c;
}

.caption {
  width: 100%;
  padding: calc(var(--unit) * 4) 0;
  border-radius: 0 0 calc(var(--unit) * 8) calc(var(--unit) * 8);
  background: #ece5d8;
  color: #3b4255;
  font-size: calc(var(--unit) * 18);
  text-align: center;
}
</style>
