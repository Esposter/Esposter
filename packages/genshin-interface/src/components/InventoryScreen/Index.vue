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
// The entry the detail panel shows, its id, and the first entry of the open tab while none is chosen
const selectedId = defineModel<string>("selectedId", { required: true });
const { backLabel, capacity, cells, currencies, isSortable, orderLabel, sortLabels, tabLabels, title } =
  defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const selectedCell = computed(() => cells.find(({ id }) => id === selectedId.value) ?? cells[0]);
</script>

<template>
  <!-- The bag, the B key's: its nine tabs across the head in the game's order, the open tab's room beside the way back,
       Its grid of four columns, the entry chosen with its detail panel, and the sort along the foot. Provisional: the
       Tabs' icons and the grid's entries' icons wait on the glyph pass, and the sort, the wallet's place and the
       Panel's stats and footer wait on the bag's other recordings -->
  <div class="inventory-screen">
    <p class="title" role="heading" aria-level="1">{{ title }}</p>
    <ul class="tabs">
      <li v-for="itemCategory of ItemCategories" :key="itemCategory">
        <button
          class="tab"
          :aria-label="tabLabels[itemCategory]"
          :aria-pressed="itemCategory === category"
          :data-category="itemCategory"
          type="button"
          @click="category = itemCategory"
        />
      </li>
    </ul>
    <p class="capacity">{{ capacity }}</p>
    <button class="back" :aria-label="backLabel" type="button" @click="emit('close')" />
    <ul class="currencies">
      <li v-for="{ id, name, quantity } of currencies" :key="id" class="currency">
        <span class="currency-name">{{ name }}</span>
        {{ quantity }}
      </li>
    </ul>
    <ul class="grid">
      <li v-for="cell of cells" :key="cell.id">
        <button
          class="cell"
          :aria-label="cell.name"
          :aria-pressed="cell.id === selectedCell?.id"
          :data-rarity="cell.rarity"
          type="button"
          @click="selectedId = cell.id"
        >
          <span class="caption">{{ cell.caption }}</span>
        </button>
      </li>
    </ul>
    <section v-if="selectedCell" class="detail" :data-rarity="selectedCell.rarity">
      <p class="detail-name">{{ selectedCell.name }}</p>
      <p class="detail-caption">{{ selectedCell.caption }}</p>
    </section>
    <div class="bar">
      <button class="trash" type="button" aria-hidden="true" tabindex="-1" />
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
  </div>
</template>

<style scoped>
/* Every place and size is in the game's 1080-high units, read off the recording of the English PC client's bag: the
   Grid's top left at 648 by 114, its cells 124 by 152 with 23 and 24 between, and the detail panel 493 wide at 1298 */
.inventory-screen {
  position: absolute;
  inset: 0;
  color: #ece3d8;
  font-size: calc(var(--unit) * 17);
}

.title {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  margin: 0;
}

.tabs,
.currencies,
.grid {
  margin: 0;
  padding: 0;
  list-style: none;
}

.tabs {
  position: absolute;
  top: calc(var(--unit) * 22);
  left: calc(var(--unit) * 557);
  display: flex;
  gap: calc(var(--unit) * 56);
}

.tab {
  width: calc(var(--unit) * 40);
  height: calc(var(--unit) * 40);
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.14);
}

.tab[aria-pressed="true"] {
  background: #ece3d8;
}

.capacity {
  position: absolute;
  top: calc(var(--unit) * 30);
  right: calc(var(--unit) * 115);
  margin: 0;
  color: #ece3d8;
  font-size: calc(var(--unit) * 20);
  font-weight: 600;
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
  background: rgb(255 255 255 / 0.14);
}

.currencies {
  position: absolute;
  top: calc(var(--unit) * 96);
  right: calc(var(--unit) * 115);
  display: flex;
  gap: calc(var(--unit) * 16);
  font-size: calc(var(--unit) * 18);
}

.currency-name {
  opacity: 0.7;
}

.grid {
  position: absolute;
  top: calc(var(--unit) * 114);
  left: calc(var(--unit) * 648);
  width: calc(var(--unit) * 565);
  height: calc(var(--unit) * 856);
  display: grid;
  grid-template-columns: repeat(4, calc(var(--unit) * 124));
  grid-auto-rows: calc(var(--unit) * 152);
  gap: calc(var(--unit) * 24) calc(var(--unit) * 23);
  overflow-y: auto;
}

.cell {
  display: flex;
  align-items: end;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  border-radius: calc(var(--unit) * 8);
  background: #6b6396;
  font: inherit;
}

.cell[data-rarity="5"] {
  background: #9d672b;
}

.cell[aria-pressed="true"] {
  box-shadow: 0 0 0 calc(var(--unit) * 3) #ece3d8;
}

.caption {
  width: 100%;
  padding: calc(var(--unit) * 4) 0;
  border-radius: 0 0 calc(var(--unit) * 8) calc(var(--unit) * 8);
  background: rgb(0 0 0 / 0.35);
  color: #ece3d8;
  font-size: calc(var(--unit) * 17);
  text-align: center;
}

.detail {
  position: absolute;
  top: calc(var(--unit) * 114);
  left: calc(var(--unit) * 1298);
  width: calc(var(--unit) * 493);
  height: calc(var(--unit) * 844);
  box-sizing: border-box;
  padding-top: calc(var(--unit) * 4);
  background: linear-gradient(
    to bottom,
    #655c83 calc(var(--unit) * 286),
    #ece3d8 calc(var(--unit) * 286),
    #ece3d8 calc(var(--unit) * 786),
    #ffebbf calc(var(--unit) * 786)
  );
  color: #3b4255;
}

.detail[data-rarity="5"] {
  background: linear-gradient(
    to bottom,
    #7a4e22 calc(var(--unit) * 286),
    #ece3d8 calc(var(--unit) * 286),
    #ece3d8 calc(var(--unit) * 786),
    #ffebbf calc(var(--unit) * 786)
  );
}

.detail-name {
  height: calc(var(--unit) * 52);
  margin: 0;
  padding: calc(var(--unit) * 10) calc(var(--unit) * 28);
  box-sizing: border-box;
  background: #a154de;
  color: #ece3d8;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
}

.detail-caption {
  margin: calc(var(--unit) * 230) 0 0;
  padding: 0 calc(var(--unit) * 28);
  font-size: calc(var(--unit) * 20);
  font-weight: 600;
}

.bar {
  position: absolute;
  top: calc(var(--unit) * 993);
  left: calc(var(--unit) * 51);
  right: calc(var(--unit) * 133);
  height: calc(var(--unit) * 48);
  display: flex;
  align-items: center;
  gap: calc(var(--unit) * 16);
}

.trash,
.order {
  width: calc(var(--unit) * 48);
  height: calc(var(--unit) * 48);
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.14);
}

.sort {
  display: flex;
  gap: calc(var(--unit) * 8);
}

.sort-choice {
  padding: calc(var(--unit) * 8) calc(var(--unit) * 14);
  border: none;
  border-radius: calc(var(--unit) * 24);
  background: rgb(255 255 255 / 0.14);
  color: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 18);
}

.sort-choice[aria-pressed="true"] {
  background: #ece3d8;
  color: #3b4255;
}
</style>
