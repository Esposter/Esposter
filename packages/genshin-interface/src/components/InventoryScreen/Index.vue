<script setup lang="ts">
import type { CurrencyCount } from "#src/models/CurrencyCount";
import type { InventoryCell } from "#src/models/InventoryCell";
import type { InventoryQuickSelect } from "#src/models/InventoryQuickSelect";
import type { InventorySort } from "#src/models/InventorySort";

import { InventorySorts } from "#src/models/InventorySort";
import { ItemCategories, ItemCategory } from "#src/models/ItemCategory";

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
  // The equipment tab's pill that opens the entry's details, in the reader's language
  detailsLabel: string;
  // Whether the dialog is open over the bag
  isConfirming: boolean;
  // Whether the chosen entries' returns do not all fit in the bag, which holds the dialog's OK off
  isDestroyFull: boolean;
  // Whether the bag is in its destroy mode, where a tick chooses an entry for a destroy rather than showing it
  isDestroying: boolean;
  // Whether the open tab offers the sort, as the weapons' and artifacts' do
  isSortable: boolean;
  // The Lock button's words, shown on an unlocked bag artifact
  lockLabel: string;
  // The sort's order in the reader's language, which a screen reader says in place of its arrow
  orderLabel: string;
  // The destroy mode's quick selects on the open tab, each choosing every entry the bag may destroy of its rarity
  quickSelects: InventoryQuickSelect[];
  // The gadget action that equips the detail's gadget to the quick-use slot, in the reader's language
  quickUseLabel: string;
  sortLabels: Record<InventorySort, string>;
  tabLabels: Record<ItemCategory, string>;
  title: string;
  // The Unlock button's words, shown on a locked bag artifact
  unlockLabel: string;
  // The detail panel's button that uses the selected entry, in the reader's language
  useLabel: string;
}
// The bag's tab icons, each traced off the recording's head bar at 1080 high.
// The Weapon tab's is hidden under the recording's webcam, so that tab keeps a placeholder disc
const itemCategoryGlyphMap: Partial<Record<ItemCategory, string>> = {
  [ItemCategory.Artifact]:
    "M55 0h29.5q.88.04.5 3h1.5q2 .5 1.5 3.5l-3.5 5.5-4.5 3.5q-1.12 3.33 1.5 2.5l9 3 4 3 6 2 11.5 10.5 5 7 6 12 1 8 3 4v2l6 7-2.5 2.5h-3l-4.5 2.5v7l-2 3v2q-3.09 7.91-9 13l-1 3.5h-1.5l-5 5-11 7-11 1-4.5-3.5-2-3v-3l-1-2.5q-3.67-1.35-2 4.5l3 3v7l1.5 1.5q5.5 1 8-1l2.5 2.5-1 1-8 10-2 4.5h-13.5l-.5-1.5-11-13v-2q1.25-2.75 6.5-1.5 1.12 2 4.5 1l1-5.5q-1.75-.92-1-3.5-2.67-1.12-2 1.5l-3.5 3.5h-2l-1-1h-6l-8-4-12.5-11.5-5-7v-2l-4-7-2-8-1.5-1.5-7-3h-2.5v-2.5l9-10 1-4 2-2v-4l5-11q4.9-8.6 12.5-14.5l5-4 12-6h3l3.5-2.5v-2l-3.5-4.5-2.5-1.5-1-5 3-1.5v-3zm15 35-4 3 1 2-1 6-8 13q-2 2-5 3l-2 3-8 4h-6l-1 1q-4-1-2 4l7 3 5 1 9 5 5 6 6 9 1 7 2 3q-1 2 2 1l2-3v-4l3-6v-2l5-6 8-7 9-3 5-3h3q2 0 1-3l-1-2h-4l-12-5-7-7q-1-3-4-3v-1l-3-4-1-4-2-2v-6l-3-3zm-6 77q1 3-1 4-1 3 2 2l2-4v-2h-3z",
  [ItemCategory.CharacterDevelopmentItem]:
    "M73 0h4v1.5q3.5 1.25 3 4.5h1.5l8 7h26l3 1 5.5 4.5 2 4v108l-3 4v1.5l-8.5 4h-26l-1 1h-3l-2.5 1-.5 2h-14l-3-3-3-1h-24q-1.25-2.25-6-1l-7.5-6.5q-1.83-2.17-1-7l-1-1v-13l1-1v-65l-1-1v-17l1-1v-3l2-5.5 3-1.5q-.75-2.25 1.5-1.5l2-2h25q.75-1.75 4-1l12.5-10.5v-1.5zm0 12-1 3 3 1q2-1 1 2l-6-1q-4 1-3 5l4 2 2 5q-1 2 2 1l1-1 1-4 3-2 2-3-3-3-2-2q-1-4-4-3zm-5 30-6 3-10 11-2 6v6l1 1-1 2 5 10 9 7 8 3h7l9-4q7-5 11-14v-12l-4-8q-4-7-11-10l-3-1h-13zm0 56q-1 2-4 1l-5 3h-2l-5 4-6 8-1 5-3 6v4l1 2 3 1h20l8-4h3l3 2 6 2h3l1 1 1-1h14l3-3-1-5-6-13-8-9-4-2q-6 1-7-2h-14z",
  [ItemCategory.Food]:
    "M124.5 20q3-.5 3.5 1.5v2l-5 5v1.5h-1.5l-4.5 4.5-1 3q.5 2 3.5 1.5l13-11q1.83-1.67 6-1 2.25.75 1.5 4.5l-10 11-3 6 2.5 1.5 14-13 .5 9.5-7 13-12.5 13.5-9 5h-19q-2 4-8 4l-6.5-6.5v-2l4-3 2-4v-3l-1-1v-10l3-8 7.5-8.5 6-5 10-6 9-3 2-2z M27.5 23h9l1 1 7 1 10 6 10.5 10.5 4 9v17l5.5 6.5 13.5 11.5q-.75 2.25 1.5 1.5l4 5 10 8 22.5 21.5v4l-4.5 7.5-3 1h-5l-10.5-9.5q-20.43-24.57-43.5-46.5-3.25.75-4-1l-1 1h-12l-4-3h-3l-11.5-10.5-5-7-3-7-2-6v-8q2-1 1-5l3.5-5.5 9-3z M61.5 92q5.04.96 7.5 4.5l3 4v2l-6 8-22.5 23.5h-8q-1-2.5-3.5-2l-2-4.5v-7l9.5-9.5 17.5-14.5 1.5-2.5 3-2z",
  [ItemCategory.Furnishing]:
    "M70.5 6h12l4.5 3.5v2l2.5 3.5h4l11 5h2l13 8 3.5 3.5q.87 3-3.5 1.5-1 2-2 0h-80q-1 2-5 1l-2.5-1 2.5-5h2l4-4 12-6h3q1.4-2.6 6-2l5.5-3.5v-2l2.5-3.5 3-1z M141.5 29q2.75-.25 2.5.5v8.5h-7.5l-5 4h-1.5l-2 5.5q2.25 1.25 1 6l3 5 1 6 2 3v5l2.5 3.5q4.75 1.25 6-1l.5 24h-8.5l-1-1-8 7h-5l-1.5-3-2.5-1q-2.75 1.25-.5 2.5v2l3 3v3l-4.5 4.5-9 4h-10l-1 1h-40l-1-1h-9l-1-1-6-1-5.5-5.5v-2l3-4v-2.5q-2.67-1.12-2 1.5l-1 2.5-2.5 1q-.75-1.75-4-1l-2.5-2.5-3.5-4.5-8-4-6.5-6.5-3-6.5q-2.96.38-3-.5v-42.5q7.59.51 12.5 5l6 1 5.5-3.5q-.5-4 2.5-4.5l5-2 1 1h88q.75-1.75 4-1l7-6 3-1h6l1-1zm-65.5 17-7 6q-3-1-2 2l-3 1v2l-15 17q-2 1-1 6l16 13h5v-1l5-6 4-3 2-3v-2l-2-4q-4-1-4 1-3-1-2 2l-6 5h-2l-4-3v-3l8-10 7-7h2l6 7 2 4 6 7v4l-19 21q-1 3 2 4h4l4-3 23-21v-3l-5-8-15-18q1-3-1-2-4-1-3-4l-2-1h-3zm35 53v2h4q-1-3-4-2zm-72 1v2h4v-2h-4zm18 0v2q-4-1-6 3l2 2 6-5q1-3-2-2zm42 3-1 1 4 3q3 1 2-1-1-4-5-3z M46.5 125h7l1 1q4.75-1.25 6 1h36l6-2h5q4.81 2.52 3.5 10l-2.5 1-8-3h-8l-4 2h-3l-1.5 1.5q.75 2.25-1.5 1.5l-4 4h-5l-8-7h-6l-1-1h-9l-5 2-2.5-3.5v-2l2.5-4.5 2-1z",
  [ItemCategory.Gadget]:
    "M52.5 19h33l1 1 15 1 4 2h9l8 3h6q.75 1.75 4 1l4.5 3.5 1 4q-.5 3-4.5 2.5-1.25-2.25-6-1l-3 2-16 5-1.5 1.5-2 5v34l-3.5 4.5h-13q-1-2-5-1l-5.5 2q-.75 3.83 2.5 5 4.75-1.25 6 1 1-2 5-1l1 1h13l3.5-3.5v-7l1-1v-15l1-1v-10l1-3 2.5-2.5 4-1 4-3h3l2-2h8l1.5 1.5q-1 4 1 5v20l1 1v27l-1 1q1 5.5-1 8l-8.5 8.5-14 9-12 6h-23l-1-1h-5l-6-2h-7l-8-4h-9l-2-2h-3l-1-1h-3l-9-3-3.5-3.5-2-3v-27l1-2.5 2.5-1h4l2 1 4.5-2.5-1.5-2.5-7-2-6.5-4.5q-1.17-6.17 1-9l-1-3 1-2-1-2 1-1v-7l1-1v-9l2-5 3.5-3.5h2l4-4 6-1 14-6zm9.5 37-12 10-8 8v1h-1l-6 6v2q2 0 2 3l9 2 3 4-1 4-2 2-1 7-2 3v5h4l4-2 5-5 3-1 10-9 5-3q3-1 2-5l-2-3-3-1h-8l-3-3 4-15 2-3v-7h-4z",
  [ItemCategory.Material]:
    "M40 0h12.5l.5 1.5 5.5 3.5 7 2 22 11h2l2 2h3l7.5 5.5q.75 4.25 4 6v26l-1 2.5q-3.25-.5-4.5 3h-7l-4 2-12 2-1.5 1.5-6 12q1 4-1 5v8l-1 2 1 1v6q1.75.75 1 4l2 4v4l-2.5 2.5-6 1-6.5-4.5-10-15-27-33q-2.17-2.83-1-9l1-1v-5l2-6 6-12 5-17 7-15.5z M121.5 63h7l9.5 5.5q.86 5.64 4 9v6l2 4v12l-1 1v13q-1.75.75-1 4l-1 3-4.5 5.5-6 3h-3q-1.5-1 1-2 3 .5 3.5-1.5l1-7-4-7v-2l-2-2-1-4-8.5-9.5-3-2-8-2-11-5h-6q-1 2-5 1l-2.5 2.5-1 7.5q-3.33 1.31-2-3.5-3-2-2-8l2-6 5.5-5.5 7-4h8l4-2 9-1 3-2q4.75 1.25 6-1z M105 103q5.5-1.25 7 2.5 2 2.5 1 8l-2 4v3l-5 9q-4.9 8.6-12.5 14.5h-18l-.5-1.5-4-5q.75-3.25-1-4v-6q1.75-.92 1-3.5l6.5-3h6l6-2 5-3 8.5-8.5 2-4.5z M30.5 108h11l12.5 11.5 5 6 1 3-4.5 3.5q-3.25-.75-4 1h-7l-7 3h-3l-3-1-12.5-12.5-6-8v-2l3.5-2.5h6l1-1h6l1-1z",
  [ItemCategory.PreciousItem]:
    "M56.5 12q3-.5 3.5 1.5l-5 3q-.75 4.75 2.5 5.5l6 1 1 1h5l1 1h14l8-3h3l2.5-2.5-3-6 5.5-.5 5 2 3.5 3.5-1 5-6.5 7.5-4.5 3.5-3.5 4.5-7 3-14 1-1-1-9-1-15.5-14.5-4-7 2.5-3.5 5-3q4.75 1.25 6-1z M50.5 51h10l9 3h13l1-1 8-1 1-1h9l2 2 4.5 1 1 4h1.5l11.5 10.5 5 8 5 12v13l-1 1v4l-3 8-10.5 11.5-10 6-5 1-9 4h-4l-6 2h-15l-5-2h-4l-4-2h-3l-9-5h-2l-4.5-2q1.13-2.67-1.5-2l-6.5-5.5-7-11-2-10 1-1v-12l4-8v-2l3-5 11.5-11.5 3.5-2.5 1.5-2.5q4.25-.75 6-4zm24.5 15-2 2v3l-3 6-3 4-7 5-6 2q-3 1-2 5l4 2h3q1 3 6 4l6 8 2 4v4l2 1 3-1 5-10 6-6 8-5h2l2-3-2-3-6-2-4-3-8-8-2-6q0-4-4-3z",
  [ItemCategory.Quest]:
    "M35.5 16h86l4 4 4 2h3l2.5 2.5 1 5-3.5 5.5-5.5 1q1 3.38-1 4.5v94l-1.5 1.5-4-1-21-11h-2l-7-4h-2l-4-3h-2l-3-2h-4l-7 3-4 3h-2l-31 15-2.5-3.5v-93l-2.5-3.5q-3.87-.63-5.5-3.5l-1-5 2-4.5 5.5-2 8-5zm40.5 13-5 2-5 5-1 3v9q2 1 1 6l5 9q-1 3 1 4v6l5 4 4-1 3-4 1-10 4-8 1-8 1-1-1-7-3-5-6-4h-5zm0 53-2 1-5 6v6l7 5 7-1 4-6v-4q-3-2-2-4-3 1-4-3h-5z",
};
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
  detailsLabel,
  isConfirming,
  isDestroyFull,
  isDestroying,
  isSortable,
  lockLabel,
  orderLabel,
  quickSelects,
  quickUseLabel,
  sortLabels,
  tabLabels,
  title,
  unlockLabel,
  useLabel,
} = defineProps<Props>();
const emit = defineEmits<{
  cancelDestroy: [];
  choose: [id: string];
  close: [];
  confirmDestroy: [];
  destroy: [];
  lock: [id: string];
  quickSelect: [rarity: number];
  quickUse: [id: string];
  toggleDestroy: [];
  use: [id: string];
}>();
const selectedCell = computed(() => cells.find(({ id }) => id === selectedId.value) ?? cells[0]);
// The dialog takes the focus as it opens, the bag behind it inert until it closes, so nothing behind it changes what OK
// Destroys, and the focus goes back to what held it once it closes, or to the trash where a confirmed destroy closed the
// Destroy mode and its Destroy button with it
const cancelButton = useTemplateRef("cancelButton");
const trashButton = useTemplateRef("trashButton");
let returnFocus: HTMLElement | undefined;
watch(
  () => isConfirming,
  async (isOpen) => {
    if (isOpen)
      returnFocus = window.document.activeElement instanceof HTMLElement ? window.document.activeElement : undefined;
    await nextTick();
    if (isOpen) cancelButton.value?.focus();
    else (returnFocus?.isConnected ? returnFocus : trashButton.value)?.focus();
  },
);
</script>

<template>
  <!-- The bag, the B key's: its nine tabs across the head in the game's order, the open tab's room beside the way back,
       Its grid of seven columns, the entry chosen with its detail panel, and the sort along the foot. Provisional: the
       Weapon tab's icon is under the recording's webcam, the grid's entries' art waits on the game's own icons, and
       the panel's stats and footer wait on the bag's other recordings -->
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
          >
            <svg v-if="itemCategoryGlyphMap[itemCategory]" viewBox="0 0 144 144" aria-hidden="true">
              <path :d="itemCategoryGlyphMap[itemCategory]" />
            </svg>
          </button>
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
            :data-selected="cell.isSelected || undefined"
            type="button"
            @click="isDestroying && cell.isDestroyable ? emit('choose', cell.id) : (selectedId = cell.id)"
          >
            <span class="stars" aria-hidden="true">{{ "★".repeat(cell.rarity) }}</span>
            <span class="caption">{{ cell.caption }}</span>
          </button>
        </li>
      </ul>
      <section v-if="selectedCell" class="detail" :data-rarity="selectedCell.rarity">
        <p class="detail-name">{{ selectedCell.name }}</p>
        <p v-if="isSortable" class="detail-stars" aria-hidden="true">{{ "★".repeat(selectedCell.rarity) }}</p>
        <p class="detail-caption">{{ selectedCell.caption }}</p>
        <button
          v-if="selectedCell.isLockable && !isDestroying"
          class="lock"
          type="button"
          @click="emit('lock', selectedCell.id)"
        >
          {{ selectedCell.isLocked ? unlockLabel : lockLabel }}
        </button>
      </section>
      <button
        v-if="selectedCell?.isUsable && !isDestroying"
        class="use"
        type="button"
        @click="emit('use', selectedCell.id)"
      >
        {{ useLabel }}
      </button>
      <span v-if="isSortable && !isDestroying" class="details">{{ detailsLabel }}</span>
      <button
        ref="trashButton"
        class="trash"
        :aria-label="destroyLabel"
        :aria-pressed="isDestroying"
        type="button"
        @click="emit('toggleDestroy')"
      >
        <svg class="trash-glyph" viewBox="0 0 128 144" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M54.5 21h21l1.5 1.5 4.5 6.5h22l3.5 3.5q1.67 1.83 1 6l-3.5 4.5q-2.5 2-8 1l-1-1h-64q-1 2-2 0-7.75 1.75-9.5-2.5-1.46-7.96 2.5-10.5l3-1h16q1-2 5-1l2.5-2.5 2.5-3.5 3-1z M27.5 54h70l5.5 2v71.5l-2.5 3.5-2 1h-68l-3-1-2.5-2.5q.75-3.25-1-4v-66l3.5-4.5zm11.5 9-4 4v46l1 1v3l1 2 6-1 2-3v-47l-1-2-3-3h-2zm24 0-4 4v41l-1 1v3l3 7 3 1q0-2 3-1l2-5q1-5-1-6-1-4 1-4v-34l-2-6-4-1zm24 0-2 1-3 3v41l-1 1 3 9 2 1h4l3-6v-46l-1-3-2-1h-3z"
          />
        </svg>
      </button>
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
        <div class="sort">
          <select v-model="sort" class="sort-select" :aria-label="sortLabels[sort]">
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
      <!-- The gadget's action under the detail panel, which equips the gadget to the quick-use slot. Provisional: its place
           is where the controller recording shows a gadget's action, the bottom bar's X, until the keyboard's is read -->
      <button
        v-if="selectedCell?.isEquipable && !isDestroying"
        class="quick-use"
        type="button"
        @click="emit('quickUse', selectedCell.id)"
      >
        {{ quickUseLabel }}
      </button>
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
   Grid's top left at 207 by 114, its cells 124 by 152 with 23 and 24 between, and the detail panel 493 wide at 1298 */
.inventory-screen {
  position: absolute;
  inset: 0;
  color: #ece3d8;
  font-size: calc(var(--unit) * 17);
}

/* The bag's head bar, a dark band across the screen's top 91 units the tabs and the way back sit in */
.inventory-screen::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(var(--unit) * 91);
  background: #221f2c;
  content: "";
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

.grid {
  position: absolute;
  top: calc(var(--unit) * 114);
  left: calc(var(--unit) * 207);
  width: calc(var(--unit) * 1006);
  height: calc(var(--unit) * 846);
  display: grid;
  grid-template-columns: repeat(7, calc(var(--unit) * 124));
  grid-auto-rows: calc(var(--unit) * 152);
  gap: calc(var(--unit) * 24) calc(var(--unit) * 23);
  overflow-y: auto;
}

/* The art's colour, each rarity's mean across the cell's width measured band by band down the art, which the caption's band
   covers from 124 units down */
.cell {
  position: relative;
  display: flex;
  align-items: end;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  border-radius: calc(var(--unit) * 8);
  background: linear-gradient(
    rgb(120 108 142),
    rgb(138 119 164) calc(var(--unit) * 64),
    rgb(155 123 170) calc(var(--unit) * 112)
  );
  font: inherit;
}

/* The stars of the entry's rarity, gold, on the art's lower edge above the caption's band */
.stars {
  position: absolute;
  right: 0;
  bottom: calc(var(--unit) * 21);
  left: 0;
  color: #f5c542;
  font-size: calc(var(--unit) * 19);
  letter-spacing: calc(var(--unit) * 1);
  line-height: calc(var(--unit) * 22);
  text-align: center;
}

.cell[data-rarity="5"] {
  background: linear-gradient(
    rgb(131 94 62),
    rgb(170 137 96) calc(var(--unit) * 48),
    rgb(172 127 60) calc(var(--unit) * 112)
  );
}

.cell[aria-pressed="true"] {
  box-shadow: 0 0 0 calc(var(--unit) * 3) #ece3d8;
}

.cell[data-selected] {
  background: #a154de;
}

.caption {
  width: 100%;
  height: calc(var(--unit) * 28);
  border-radius: 0 0 calc(var(--unit) * 8) calc(var(--unit) * 8);
  background: #e5e3dd;
  color: #45434c;
  font-size: calc(var(--unit) * 22);
  font-weight: 600;
  line-height: calc(var(--unit) * 30);
  text-align: center;
}

/* The info block's purple runs from under the name band to the cream body at 286 units, measured off the recording */
.detail {
  --detail-head-color: #635687;
  --detail-head-end-color: #a176b5;

  position: absolute;
  top: calc(var(--unit) * 114);
  left: calc(var(--unit) * 1298);
  width: calc(var(--unit) * 493);
  height: calc(var(--unit) * 844);
  box-sizing: border-box;
  background: linear-gradient(
    to bottom,
    var(--detail-head-color) calc(var(--unit) * 60),
    var(--detail-head-end-color) calc(var(--unit) * 286),
    #ece3d8 calc(var(--unit) * 286),
    #ece3d8 calc(var(--unit) * 786),
    #fde5b9 calc(var(--unit) * 786)
  );
  color: #3b4255;
}

.detail[data-rarity="5"] {
  --detail-head-color: #7a4e22;
  --detail-head-end-color: #7a4e22;
}

.detail-name {
  height: calc(var(--unit) * 60);
  margin: 0;
  padding: 0 calc(var(--unit) * 28);
  box-sizing: border-box;
  background: #9e57d7;
  color: #ece3d8;
  font-size: calc(var(--unit) * 37);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 2);
  line-height: calc(var(--unit) * 60);
}

/* The rarity's gold stars on the info block under the name, on the equipment tabs only */
.detail-stars {
  position: absolute;
  top: calc(var(--unit) * 242);
  left: calc(var(--unit) * 29);
  margin: 0;
  color: #f5c542;
  font-size: calc(var(--unit) * 28);
  letter-spacing: calc(var(--unit) * 4.5);
  line-height: calc(var(--unit) * 28);
}

/* The level's dark tag, 254 units under the name band */
.detail-caption {
  width: fit-content;
  margin: calc(var(--unit) * 254) 0 0 calc(var(--unit) * 28);
  padding: calc(var(--unit) * 2) calc(var(--unit) * 8);
  border-radius: calc(var(--unit) * 4);
  background: rgb(45 48 60 / 0.9);
  color: #ece3d8;
  font-size: calc(var(--unit) * 24);
  font-weight: 600;
  line-height: calc(var(--unit) * 20);
}

/* The bottom right pill: Use on a usable entry, and on an equipment tab the Details its page opens. Its gold ring stands at its
   left, as the game's controller hint does */
.use,
.details {
  position: absolute;
  top: calc(var(--unit) * 987);
  left: calc(var(--unit) * 1562);
  width: calc(var(--unit) * 226);
  height: calc(var(--unit) * 63);
  box-sizing: border-box;
  padding: 0 0 0 calc(var(--unit) * 30);
  border: none;
  border-radius: calc(var(--unit) * 32);
  background: #ece3d8;
  color: #3b4255;
  font: inherit;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  text-align: center;
}

/* The word's cap height is the game's 23 units, so it sets at 33 and its line stands on the pill's centre */
.details {
  font-size: calc(var(--unit) * 33);
  line-height: calc(var(--unit) * 63);
}

.use::before,
.details::before {
  position: absolute;
  top: 50%;
  left: calc(var(--unit) * 26);
  width: calc(var(--unit) * 24);
  height: calc(var(--unit) * 24);
  box-sizing: border-box;
  border: calc(var(--unit) * 5) solid #b0902c;
  border-radius: 50%;
  content: "";
  transform: translateY(-50%);
}

/* The foot bar's pieces, measured off the bag's recording at 1080 high: the trash, the filter and the sort's dropdown and
   order on an equipment tab, the Primogems and Mora on the rest. The dropdown is the game's own pill, its list drawn by the
   browser until its open motion is measured */
.trash,
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
  top: calc(var(--unit) * 992);
  left: calc(var(--unit) * 50);
  background: #ece3d8;
}

.trash[aria-pressed="true"] {
  background: #a154de;
}

/* The trash glyph is the game's own, traced off the bag's recording at its place in the button */
.trash-glyph {
  position: absolute;
  top: calc(var(--unit) * 6);
  left: calc(var(--unit) * 10);
  width: calc(var(--unit) * 32);
  height: calc(var(--unit) * 36);
  fill: #3b4255;
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

.lock,
.quick-select,
.quick-use,
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

.quick-use {
  position: absolute;
  top: calc(var(--unit) * 960);
  left: calc(var(--unit) * 1298);
}

.lock {
  position: absolute;
  bottom: calc(var(--unit) * 88);
  left: calc(var(--unit) * 28);
  width: calc(var(--unit) * 437);
  height: calc(var(--unit) * 52);
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

.order {
  top: calc(var(--unit) * 992);
  left: calc(var(--unit) * 483);
  background: #ece3d8;
}

.sort {
  position: absolute;
  top: calc(var(--unit) * 993);
  left: calc(var(--unit) * 140);
  width: calc(var(--unit) * 324);
  height: calc(var(--unit) * 48);
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

/* The pills sit at the game's left edges, 40 units apart, their figures 19 units high in the game's face. The Primogem and Mora
   marks are drawn in the game's colours until the glyph pass traces them from the game's own icons */
.currencies {
  position: absolute;
  top: calc(var(--unit) * 1001);
  left: calc(var(--unit) * 139);
  display: flex;
  gap: calc(var(--unit) * 40);
  font-size: calc(var(--unit) * 29);
  font-weight: 600;
}

.currency {
  display: flex;
  align-items: center;
  gap: calc(var(--unit) * 11);
  height: calc(var(--unit) * 38);
  padding: 0 calc(var(--unit) * 14);
  border-radius: calc(var(--unit) * 19);
  background: rgb(52 62 80 / 0.5);
}

.currency-icon {
  width: calc(var(--unit) * 27);
  height: calc(var(--unit) * 27);
}

/* Signika's figures run wider than the game's face at its height, so the Primogem's figures are set tighter to its width */
.currency[data-currency="Primogem"] {
  letter-spacing: calc(var(--unit) * -1.5);
}

.currency[data-currency="Primogem"] .currency-icon {
  width: calc(var(--unit) * 31);
  height: calc(var(--unit) * 31);
  clip-path: var(--sparkle-clip-path);
  background: linear-gradient(160deg, #d9f0ff, #7fb8ff 50%, #d6b3ff);
}

.currency[data-currency="Mora"] .currency-icon {
  width: calc(var(--unit) * 30);
  height: calc(var(--unit) * 30);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff1a8, #e0a52c 55%, #a86f1a);
}

/* The top-up is a light disc with its plus, which overhangs the pill's end by a unit */
.top-up {
  position: relative;
  width: calc(var(--unit) * 32);
  height: calc(var(--unit) * 32);
  margin-left: calc(var(--unit) * 10);
  margin-right: calc(var(--unit) * -13);
  border-radius: 50%;
  background: #ece3d8;
}

.top-up::before,
.top-up::after {
  position: absolute;
  top: 50%;
  left: 50%;
  background: #3b4255;
  content: "";
  transform: translate(-50%, -50%);
}

.top-up::before {
  width: calc(var(--unit) * 16);
  height: calc(var(--unit) * 3);
}

.top-up::after {
  width: calc(var(--unit) * 3);
  height: calc(var(--unit) * 16);
}

.currency-name {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
</style>

<style scoped src="../../styles/confirmDialog.css"></style>
