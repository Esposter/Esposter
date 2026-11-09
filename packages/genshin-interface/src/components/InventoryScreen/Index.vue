<script setup lang="ts">
import type { CurrencyCount } from "#src/models/CurrencyCount";
import type { InventoryCell } from "#src/models/InventoryCell";
import type { InventoryQuickSelect } from "#src/models/InventoryQuickSelect";
import type { InventorySort } from "#src/models/InventorySort";
import type { InventoryWeaponDetails } from "#src/models/InventoryWeaponDetails";
import type { ItemCategory } from "#src/models/ItemCategory";

import GameButton from "#src/components/GameButton/Index.vue";
import Actions from "#src/components/InventoryScreen/Actions/Index.vue";
import Confirm from "#src/components/InventoryScreen/Confirm/Index.vue";
import Currencies from "#src/components/InventoryScreen/Currencies/Index.vue";
import Destroy from "#src/components/InventoryScreen/Destroy/Index.vue";
import Detail from "#src/components/InventoryScreen/Detail/Index.vue";
import Grid from "#src/components/InventoryScreen/Grid/Index.vue";
import InventoryScreenHeader from "#src/components/InventoryScreen/Header/Index.vue";
import Sort from "#src/components/InventoryScreen/Sort/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";
import { GAME_REPLY_HOVER_INK } from "#src/services/constants";
import { useDestroyFocus } from "#src/services/useDestroyFocus";

interface Props {
  // The slider's name for assistive tech, the game's "Amount to use" line in the reader's language
  amountLabel: string;
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
  // The weapons' details by the entry's id, drawn by the detail panel while that entry is the one it shows
  weaponDetails?: Record<string, InventoryWeaponDetails>;
}

const category = defineModel<ItemCategory>("category", { required: true });
const sort = defineModel<InventorySort>("sort", { required: true });
const isDescending = defineModel<boolean>("isDescending", { required: true });
// The entry the detail panel shows, its id, and the first entry of the open tab while none is chosen
const selectedId = defineModel<string>("selectedId", { required: true });
const { cells, isConfirming } = defineProps<Props>();
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
  use: [id: string, amount: number];
}>();
const selectedCell = computed(() => cells.find(({ id }) => id === selectedId.value) ?? cells[0]);
useDestroyFocus(() => isConfirming);
</script>

<template>
  <!-- The bag, the B key's: its nine tabs across the head in the game's order, the open tab's room beside the way back,
       Its grid of seven columns, the entry chosen with its detail panel, and the sort along the foot. Provisional: the
       Weapon tab's icon is under the recording's webcam, the grid's entries' art waits on the game's own icons, and
       the panel's stats and footer wait on the bag's other recordings -->
  <div class="inventory-screen">
    <div class="bag" :inert="isConfirming">
      <p class="title" role="heading" aria-level="1">{{ title }}</p>
      <InventoryScreenHeader v-model:category="category" :back-label :capacity :tab-labels @close="emit('close')" />
      <Grid
        :cells
        :is-destroying
        :selected-cell
        @choose="(id) => emit('choose', id)"
        @select="(id) => (selectedId = id)"
      />
      <Detail
        v-if="selectedCell"
        :cell="selectedCell"
        :is-destroying
        :is-sortable
        :lock-label
        :unlock-label
        :weapon="weaponDetails?.[selectedCell.id]"
        @lock="(id) => emit('lock', id)"
      />
      <Actions
        :key="selectedCell?.id"
        :amount-label
        :details-label
        :is-destroying
        :is-sortable
        :selected-cell
        :use-label
        @use="(id, amount) => emit('use', id, amount)"
      />
      <GameButton
        ref="trashButton"
        class="trash foot-disc"
        :aria-label="destroyLabel"
        :aria-pressed="isDestroying"
        :kind="GameButtonKind.Disc"
        tip=""
        @click="emit('toggleDestroy')"
      >
        <svg class="trash-glyph" viewBox="0 0 128 144" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M54.5 21h21l1.5 1.5 4.5 6.5h22l3.5 3.5q1.67 1.83 1 6l-3.5 4.5q-2.5 2-8 1l-1-1h-64q-1 2-2 0-7.75 1.75-9.5-2.5-1.46-7.96 2.5-10.5l3-1h16q1-2 5-1l2.5-2.5 2.5-3.5 3-1z M27.5 54h70l5.5 2v71.5l-2.5 3.5-2 1h-68l-3-1-2.5-2.5q.75-3.25-1-4v-66l3.5-4.5zm11.5 9-4 4v46l1 1v3l1 2 6-1 2-3v-47l-1-2-3-3h-2zm24 0-4 4v41l-1 1v3l3 7 3 1q0-2 3-1l2-5q1-5-1-6-1-4 1-4v-34l-2-6-4-1zm24 0-2 1-3 3v41l-1 1 3 9 2 1h4l3-6v-46l-1-3-2-1h-3z"
          />
        </svg>
      </GameButton>
      <Destroy
        v-if="isDestroying"
        :destroy-button-label
        :destroy-cannot-label
        :destroy-names
        :destroy-selected-label
        :destroy-tip-label
        :quick-selects
        :selected-cell
        @destroy="emit('destroy')"
        @quick-select="(rarity) => emit('quickSelect', rarity)"
      />
      <Sort v-else-if="isSortable" v-model:sort="sort" v-model:is-descending="isDescending" :order-label :sort-labels />
      <Currencies v-else :currencies />
      <!-- The gadget's action under the detail panel, which equips the gadget to the quick-use slot. Provisional: its place
           is where the controller recording shows a gadget's action, the bottom bar's X, until the keyboard's is read -->
      <GameButton
        v-if="selectedCell?.isEquipable && !isDestroying"
        class="quick-use translucent-button"
        :kind="GameButtonKind.Row"
        tip=""
        @click="emit('quickUse', selectedCell.id)"
      >
        {{ quickUseLabel }}
      </GameButton>
    </div>
    <Confirm
      v-if="isConfirming"
      ref="confirm"
      :cancel-label
      :destroy-confirm-button-label
      :destroy-confirm-list-label
      :destroy-confirm-title
      :destroy-confirm-warning-label
      :destroy-full-label
      :destroy-names
      :destroy-recovered-label
      :destroy-recovered-names
      :is-destroy-full
      @cancel-destroy="emit('cancelDestroy')"
      @confirm-destroy="emit('confirmDestroy')"
    />
  </div>
</template>

<style scoped>
/* Every place and size is in the game's 1080-high units, read off the recording of the English PC client's bag: the
   Grid's top left at 207 by 114, its cells 124 by 152 with 23 and 24 between, and the detail panel 493 wide at 1298 */
.inventory-screen {
  --rarity-gold: #ffca30;

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

/* The foot bar's trash, measured off the bag's recording at 1080 high */
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
  fill: v-bind(GAME_REPLY_HOVER_INK);
}

.quick-use {
  position: absolute;
  top: calc(var(--unit) * 960);
  left: calc(var(--unit) * 1298);
}
</style>

<style scoped src="../../styles/translucentButton.css"></style>

<style scoped src="../../styles/footDisc.css"></style>
