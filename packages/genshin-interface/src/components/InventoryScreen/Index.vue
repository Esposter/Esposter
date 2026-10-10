<script setup lang="ts">
import type { CurrencyCount } from "#src/models/CurrencyCount";
import type { InventoryCell } from "#src/models/InventoryCell";
import type { InventoryQuickSelect } from "#src/models/InventoryQuickSelect";
import type { InventorySort } from "#src/models/InventorySort";
import type { ItemCategory } from "#src/models/ItemCategory";

import { InventorySorts } from "#src/models/InventorySort";
import { ItemCategories } from "#src/models/ItemCategory";
import { computed, nextTick, useTemplateRef, watch } from "vue";

interface Props {
  // The way back to the world in the reader's language
  backLabel: string;
  // The dialog's way out without destroying, in the reader's language
  cancelLabel: string;
  // The open tab's room as the game words it, "" for a tab whose items share the bag's room
  capacity: string;
  // The open tab's entries in the order the game shows them
  cells: InventoryCell[];
  // The counts the bag shows beside its tabs
  currencies: CurrencyCount[];
  // The Destroy button that opens the dialog, and the dialog's own OK that destroys the chosen entries
  destroyButtonLabel: string;
  // The destroy mode's warning that the entry cannot be destroyed, shown on the chosen entry the bag never destroys
  destroyCannotLabel: string;
  destroyConfirmButtonLabel: string;
  // The dialog's title, the line over its list of names, and the warning that the destruction cannot be undone
  destroyConfirmListLabel: string;
  destroyConfirmTitle: string;
  destroyConfirmWarningLabel: string;
  // The line the dialog shows where the bag cannot take what the chosen entries return, in the reader's language
  destroyFullLabel: string;
  // The trash's way into the destroy mode, in the reader's language
  destroyLabel: string;
  // The names of the entries chosen for a destroy, listed in its dialog
  destroyNames: string[];
  // The materials the chosen entries return, each listed as its name and count, under the dialog's recovered label
  destroyRecoveredLabel: string;
  destroyRecoveredNames: string[];
  // The count beside the Destroy button, `{0}/{1} selected` filled in the reader's language
  destroySelectedLabel: string;
  // The destroy mode's opening line in the reader's language
  destroyTipLabel: string;
  // Whether the dialog is open over the bag
  isConfirming?: true;
  // Whether the chosen entries' returns do not all fit in the bag, which holds the dialog's OK off
  isDestroyFull?: true;
  // Whether the bag is in its destroy mode, where a tick chooses an entry for a destroy rather than showing it
  isDestroying?: true;
  // Whether the open tab offers the sort, as the weapons' and artifacts' do
  isSortable?: true;
  // The sort's order in the reader's language, which a screen reader says in place of its arrow
  orderLabel: string;
  // The destroy mode's quick selects on the open tab, each choosing every entry the bag may destroy of its rarity
  quickSelects: InventoryQuickSelect[];
  sortLabels: Record<InventorySort, string>;
  tabLabels: Record<ItemCategory, string>;
  title: string;
}

const category = defineModel<ItemCategory>("category", { required: true });
const sort = defineModel<InventorySort>("sort", { required: true });
const isDescending = defineModel<boolean>("isDescending", { required: true });
// The entry the detail panel shows, its id, and the first entry of the open tab while none is chosen
const selectedId = defineModel<string>("selectedId", { required: true });
const {
  backLabel,
  cancelLabel,
  capacity,
  cells,
  currencies,
  destroyButtonLabel,
  destroyCannotLabel,
  destroyConfirmButtonLabel,
  destroyConfirmListLabel,
  destroyConfirmTitle,
  destroyConfirmWarningLabel,
  destroyFullLabel,
  destroyLabel,
  destroyNames,
  destroyRecoveredLabel,
  destroyRecoveredNames,
  destroySelectedLabel,
  destroyTipLabel,
  isConfirming,
  isDestroyFull,
  isDestroying,
  isSortable,
  orderLabel,
  quickSelects,
  sortLabels,
  tabLabels,
  title,
} = defineProps<Props>();
const emit = defineEmits<{
  cancelDestroy: [];
  choose: [id: string];
  close: [];
  confirmDestroy: [];
  destroy: [];
  quickSelect: [rarity: number];
  toggleDestroy: [];
}>();
const selectedCell = computed(() => cells.find(({ id }) => id === selectedId.value) ?? cells[0]);
// The dialog takes the focus as it opens, the bag behind it inert until it closes, so nothing behind it changes what OK
// Destroys, and the focus goes back to what held it once it closes
const cancelButton = useTemplateRef("cancelButton");
let returnFocus: HTMLElement | undefined;
watch(
  () => isConfirming,
  async (isOpen) => {
    if (isOpen)
      returnFocus = window.document.activeElement instanceof HTMLElement ? window.document.activeElement : undefined;
    await nextTick();
    if (isOpen) cancelButton.value?.focus();
    else returnFocus?.focus();
  },
);
</script>

<template>
  <!-- The bag, the B key's: its nine tabs across the head in the game's order, the open tab's room beside the way back,
       Its grid of four columns, the entry chosen with its detail panel, and the sort along the foot. Provisional: the
       Tabs' icons and the grid's entries' icons wait on the glyph pass, and the sort, the wallet's place and the
       Panel's stats and footer wait on the bag's other recordings -->
  <div class="inventory-screen">
    <div class="bag" :inert="isConfirming">
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
      <ul class="grid">
        <li v-for="cell of cells" :key="cell.id">
          <button
            class="cell"
            :aria-label="cell.name"
            :aria-pressed="isDestroying ? Boolean(cell.isSelected) : cell.id === selectedCell?.id"
            :data-rarity="cell.rarity"
            :data-selected="cell.isSelected"
            type="button"
            @click="isDestroying && cell.isDestroyable ? emit('choose', cell.id) : (selectedId = cell.id)"
          >
            <span class="caption">{{ cell.caption }}</span>
          </button>
        </li>
      </ul>
      <section v-if="selectedCell" class="detail" :data-rarity="selectedCell.rarity">
        <p class="detail-name">{{ selectedCell.name }}</p>
        <p class="detail-caption">{{ selectedCell.caption }}</p>
      </section>
      <button
        class="trash"
        :aria-label="destroyLabel"
        :aria-pressed="isDestroying"
        type="button"
        @click="emit('toggleDestroy')"
      />
      <!-- The destroy mode's foot, in place of the sort or the currencies: its opening line, the quick selects by rarity,
         the count of the chosen entries and the Destroy button that opens the dialog. Provisional until the mode is recorded -->
      <section v-if="isDestroying" class="destroy">
        <p class="destroy-tip">{{ destroyTipLabel }}</p>
        <p v-if="selectedCell && !selectedCell.isDestroyable" class="destroy-cannot">{{ destroyCannotLabel }}</p>
        <ul class="quick-selects">
          <li v-for="{ label, rarity } of quickSelects" :key="rarity">
            <button class="quick-select" :data-rarity="rarity" type="button" @click="emit('quickSelect', rarity)">
              {{ label }}
            </button>
          </li>
        </ul>
        <p class="destroy-count">{{ destroySelectedLabel }}</p>
        <button class="destroy-button" :disabled="!destroyNames.length" type="button" @click="emit('destroy')">
          {{ destroyButtonLabel }}
        </button>
      </section>
      <template v-else-if="isSortable">
        <span class="filter" />
        <div class="sort">
          <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -- the sort's caption is no game text key yet, so no name in the reader's language exists until the bag's sort recording keys it; its options name it meanwhile -->
          <select v-model="sort" class="sort-select">
            <option v-for="inventorySort of InventorySorts" :key="inventorySort" :value="inventorySort">
              {{ sortLabels[inventorySort] }}
            </option>
          </select>
        </div>
        <button
          class="order"
          :aria-label="orderLabel"
          :data-descending="isDescending"
          type="button"
          @click="isDescending = !isDescending"
        />
      </template>
      <ul v-else class="currencies">
        <li v-for="{ id, isTopUp, name, quantity } of currencies" :key="id" class="currency" :data-currency="id">
          <span class="currency-name">{{ name }}</span>
          <span class="currency-icon" />
          {{ quantity }}
          <span v-if="isTopUp" class="top-up" />
        </li>
      </ul>
    </div>
    <!-- The dialog the Destroy button opens over the bag: the entries to be destroyed, and the warning that it cannot be
         undone, in the game's own wording. Provisional until the dialog is recorded -->
    <section v-if="isConfirming" class="confirm" role="dialog" aria-modal="true" :aria-label="destroyConfirmTitle">
      <p class="confirm-title">{{ destroyConfirmTitle }}</p>
      <p class="confirm-list-label">{{ destroyConfirmListLabel }}</p>
      <ul class="confirm-names">
        <li v-for="(name, index) of destroyNames" :key="index">{{ name }}</li>
      </ul>
      <p class="confirm-warning">{{ destroyConfirmWarningLabel }}</p>
      <p v-if="isDestroyFull" class="confirm-warning">{{ destroyFullLabel }}</p>
      <template v-if="destroyRecoveredNames.length">
        <p class="confirm-list-label">{{ destroyRecoveredLabel }}</p>
        <ul class="confirm-names">
          <li v-for="(name, index) of destroyRecoveredNames" :key="index">{{ name }}</li>
        </ul>
      </template>
      <div class="confirm-buttons">
        <button ref="cancelButton" class="confirm-button" type="button" @click="emit('cancelDestroy')">
          {{ cancelLabel }}
        </button>
        <button :disabled="isDestroyFull" class="confirm-button" type="button" @click="emit('confirmDestroy')">
          {{ destroyConfirmButtonLabel }}
        </button>
      </div>
    </section>
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

/* The bag's own pieces, placed against the screen as if the wrapper that makes them inert under the dialog were not there */
.bag {
  display: contents;
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

.cell[data-selected] {
  background: #a154de;
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

/* The foot bar's pieces, measured off the bag's recording at 1080 high: the trash, the filter and the sort's dropdown and
   order on an equipment tab, the Primogems and Mora on the rest. The dropdown is the game's own pill, its list drawn by the
   browser until its open motion is measured */
.trash,
.filter,
.order {
  position: absolute;
  width: calc(var(--unit) * 50);
  height: calc(var(--unit) * 50);
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.14);
}

.trash {
  top: calc(var(--unit) * 988);
  left: calc(var(--unit) * 47);
  width: calc(var(--unit) * 58);
  height: calc(var(--unit) * 58);
}

.trash[aria-pressed="true"] {
  background: #a154de;
}

/* The destroy mode's foot and dialog are placed in the game's 1080-high units by the recording, not yet measured, so
   they sit in the foot's band and the screen's centre until then: the count and the Destroy button share the quick
   selects' row, so the foot's three rows end above the screen's 1080 */
.destroy {
  position: absolute;
  top: calc(var(--unit) * 960);
  left: calc(var(--unit) * 230);
  right: calc(var(--unit) * 47);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--unit) * 12);
}

.destroy-tip,
.destroy-cannot {
  margin: 0;
  width: 100%;
}

.destroy-count {
  margin: 0;
}

.destroy-cannot {
  color: #ff9a7a;
}

.quick-selects {
  display: flex;
  gap: calc(var(--unit) * 10);
  margin: 0;
  padding: 0;
  list-style: none;
}

.quick-select,
.destroy-button,
.confirm-button {
  padding: calc(var(--unit) * 10) calc(var(--unit) * 20);
  border: none;
  border-radius: calc(var(--unit) * 8);
  background: rgb(255 255 255 / 0.14);
  color: inherit;
  font: inherit;
}

.destroy-button:disabled {
  opacity: 0.4;
}

.confirm {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--unit) * 560);
  padding: calc(var(--unit) * 32);
  transform: translate(-50%, -50%);
  border-radius: calc(var(--unit) * 12);
  background: #2b2a3d;
}

.confirm-title,
.confirm-list-label,
.confirm-warning {
  margin: 0 0 calc(var(--unit) * 12);
}

.confirm-title {
  font-size: calc(var(--unit) * 22);
}

.confirm-names {
  margin: 0 0 calc(var(--unit) * 12);
  padding: 0;
  list-style: none;
}

.confirm-warning {
  color: #ff9a7a;
}

.confirm-buttons {
  display: flex;
  justify-content: flex-end;
  gap: calc(var(--unit) * 12);
}

.filter {
  top: calc(var(--unit) * 992);
  left: calc(var(--unit) * 140);
}

.order {
  top: calc(var(--unit) * 992);
  left: calc(var(--unit) * 532);
  width: calc(var(--unit) * 48);
  height: calc(var(--unit) * 48);
  background: #ece3d8;
}

.sort {
  position: absolute;
  top: calc(var(--unit) * 992);
  left: calc(var(--unit) * 208);
  width: calc(var(--unit) * 304);
  height: calc(var(--unit) * 50);
}

.sort-select {
  width: 100%;
  height: 100%;
  padding: 0 calc(var(--unit) * 18);
  border: none;
  border-radius: calc(var(--unit) * 25);
  background: #ece3d8;
  color: #3b4255;
  appearance: none;
  font: inherit;
  font-size: calc(var(--unit) * 22);
  font-weight: 600;
}

.sort::after {
  position: absolute;
  top: 50%;
  right: calc(var(--unit) * 26);
  width: 0;
  height: 0;
  border-top: calc(var(--unit) * 6) solid #3b4255;
  border-right: calc(var(--unit) * 6) solid transparent;
  border-left: calc(var(--unit) * 6) solid transparent;
  content: "";
  pointer-events: none;
  transform: translateY(-50%);
}

/* The figures are the game's cap height, 30 units, and the top-up plus overhangs the pill's end */
.currencies {
  position: absolute;
  top: calc(var(--unit) * 1002);
  left: calc(var(--unit) * 140);
  display: flex;
  gap: calc(var(--unit) * 43);
  font-size: calc(var(--unit) * 30);
  font-weight: 600;
}

.currency {
  display: flex;
  align-items: center;
  gap: calc(var(--unit) * 12);
  height: calc(var(--unit) * 35);
  padding: 0 calc(var(--unit) * 14);
  border-radius: calc(var(--unit) * 18);
  background: rgb(38 42 56 / 0.5);
}

/* Provisional: the Primogem and Mora marks and the top-up plus, until the glyph pass traces them from the game's own icons */
.currency-icon {
  width: calc(var(--unit) * 26);
  height: calc(var(--unit) * 26);
  border-radius: 50%;
  background: #d8e4f0;
}

.top-up {
  width: calc(var(--unit) * 31);
  height: calc(var(--unit) * 31);
  margin-left: calc(var(--unit) * 1);
  margin-right: calc(var(--unit) * -14);
  border-radius: 50%;
  background: #ece3d8;
}

.currency-name {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
</style>
