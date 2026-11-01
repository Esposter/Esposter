<script setup lang="ts">
import type { InventoryCell } from "#src/models/InventoryCell";

import { GAME_ROW_PRESS } from "#src/services/constants";

interface Props {
  // The equipment tab's pill that opens the entry's details, in the reader's language
  detailsLabel: string;
  // Whether the bag is in its destroy mode, where a tick chooses an entry for a destroy rather than showing it
  isDestroying: boolean;
  // Whether the open tab offers the sort, as the weapons' and artifacts' do
  isSortable: boolean;
  // The entry the detail panel shows, whose Use pill shows on a usable one
  selectedCell?: InventoryCell;
  // The detail panel's button that uses the selected entry, in the reader's language
  useLabel: string;
}

const emit = defineEmits<{ use: [id: string] }>();
const { detailsLabel, isDestroying, isSortable, selectedCell, useLabel } = defineProps<Props>();
</script>

<template>
  <button
    v-if="selectedCell?.isUsable && !isDestroying"
    class="use cream-pill-lit"
    type="button"
    @click="emit('use', selectedCell.id)"
  >
    {{ useLabel }}
  </button>
  <span v-if="isSortable && !isDestroying" class="details">{{ detailsLabel }}</span>
</template>

<style scoped>
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

.use:enabled:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) {
  background-image: linear-gradient(v-bind(GAME_ROW_PRESS), v-bind(GAME_ROW_PRESS));
}
</style>

<style scoped src="../../../styles/creamPillLit.css"></style>
