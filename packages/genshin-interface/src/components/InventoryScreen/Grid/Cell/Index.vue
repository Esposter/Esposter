<script setup lang="ts">
import type { InventoryCell } from "#src/models/InventoryCell";

interface Props {
  // The entry the cell shows, its name, rarity and caption
  cell: InventoryCell;
  // Whether the bag is in its destroy mode, where a tick chooses an entry for a destroy rather than showing it
  isDestroying: boolean;
  // Whether the detail panel shows this entry, which the cell is pressed for outside the destroy mode
  isShown: boolean;
}

const emit = defineEmits<{ choose: [id: string]; select: [id: string] }>();
const { cell, isDestroying, isShown } = defineProps<Props>();
</script>

<template>
  <button
    class="cell"
    :aria-label="cell.name"
    :aria-pressed="isDestroying ? Boolean(cell.isSelected) : isShown"
    :data-rarity="cell.rarity"
    :data-selected="cell.isSelected || undefined"
    type="button"
    @click="isDestroying && cell.isDestroyable ? emit('choose', cell.id) : emit('select', cell.id)"
  >
    <span class="stars" aria-hidden="true">{{ "★".repeat(cell.rarity) }}</span>
    <span class="caption">{{ cell.caption }}</span>
  </button>
</template>

<style scoped>
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
</style>
