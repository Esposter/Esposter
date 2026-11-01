<script setup lang="ts">
import type { InventorySort } from "#src/models/InventorySort";

import { InventorySorts } from "#src/models/InventorySort";

interface Props {
  // The sort's order in the reader's language, which a screen reader says in place of its arrow
  orderLabel: string;
  sortLabels: Record<InventorySort, string>;
}

const isDescending = defineModel<boolean>("isDescending", { required: true });
const sort = defineModel<InventorySort>("sort", { required: true });
const { orderLabel, sortLabels } = defineProps<Props>();
</script>

<template>
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

<style scoped>
/* The filter and the sort's dropdown on an equipment tab, measured off the bag's recording at 1080 high. The
   dropdown is the game's own pill, its list drawn by the browser until its open motion is measured */
.order {
  position: absolute;
  width: calc(var(--unit) * 50);
  height: calc(var(--unit) * 50);
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.14);
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
</style>
