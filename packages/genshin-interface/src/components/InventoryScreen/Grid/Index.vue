<script setup lang="ts">
import type { InventoryCell } from "#src/models/InventoryCell";

import Cell from "#src/components/InventoryScreen/Grid/Cell/Index.vue";

interface Props {
  // The open tab's entries in the order the game shows them
  cells: InventoryCell[];
  // Whether the bag is in its destroy mode, where a tick chooses an entry for a destroy rather than showing it
  isDestroying: boolean;
  // The entry the detail panel shows, which the grid presses, the open tab's first entry while none is chosen
  selectedCell?: InventoryCell;
}

const emit = defineEmits<{ choose: [id: string]; select: [id: string] }>();
const { cells, isDestroying, selectedCell } = defineProps<Props>();
</script>

<template>
  <ul class="grid">
    <li v-for="cell of cells" :key="cell.id">
      <Cell
        :cell
        :is-destroying="isDestroying"
        :is-shown="cell.id === selectedCell?.id"
        @choose="(id) => emit('choose', id)"
        @select="(id) => emit('select', id)"
      />
    </li>
  </ul>
</template>

<style scoped>
.grid {
  margin: 0;
  padding: 0;
  list-style: none;
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
</style>
