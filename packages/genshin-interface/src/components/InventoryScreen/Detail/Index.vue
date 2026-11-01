<script setup lang="ts">
import type { InventoryCell } from "#src/models/InventoryCell";

interface Props {
  // The entry the panel shows, its name, rarity, caption and lock
  cell: InventoryCell;
  // Whether the bag is in its destroy mode, where a tick chooses an entry for a destroy rather than showing it
  isDestroying: boolean;
  // Whether the open tab offers the sort, as the weapons' and artifacts' do
  isSortable: boolean;
  // The Lock button's words, shown on an unlocked bag artifact
  lockLabel: string;
  // The Unlock button's words, shown on a locked bag artifact
  unlockLabel: string;
}

const emit = defineEmits<{ lock: [id: string] }>();
const { cell, isDestroying, isSortable, lockLabel, unlockLabel } = defineProps<Props>();
</script>

<template>
  <section class="detail" :data-rarity="cell.rarity">
    <p class="detail-name">{{ cell.name }}</p>
    <p v-if="isSortable" class="detail-stars" aria-hidden="true">{{ "★".repeat(cell.rarity) }}</p>
    <p class="detail-caption">{{ cell.caption }}</p>
    <button v-if="cell.isLockable && !isDestroying" class="lock" type="button" @click="emit('lock', cell.id)">
      {{ cell.isLocked ? unlockLabel : lockLabel }}
    </button>
  </section>
</template>

<style scoped>
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

.lock {
  padding: calc(var(--unit) * 10) calc(var(--unit) * 20);
  border: none;
  border-radius: calc(var(--unit) * 8);
  background: rgb(255 255 255 / 0.14);
  color: inherit;
  font: inherit;
}

.lock {
  position: absolute;
  bottom: calc(var(--unit) * 88);
  left: calc(var(--unit) * 28);
  width: calc(var(--unit) * 437);
  height: calc(var(--unit) * 52);
}
</style>
