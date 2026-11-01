<script setup lang="ts">
import type { InventorySort } from "#src/models/InventorySort";

import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";
import { InventorySorts } from "#src/models/InventorySort";
import { GAME_ROW_PRESS } from "#src/services/constants";

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
    <select v-model="sort" class="sort-select cream-pill-lit" :aria-label="sortLabels[sort]">
      <option v-for="inventorySort of InventorySorts" :key="inventorySort" :value="inventorySort">
        {{ sortLabels[inventorySort] }}
      </option>
    </select>
  </div>
  <GameButton
    class="order foot-disc"
    :aria-label="orderLabel"
    :data-descending="isDescending"
    :kind="GameButtonKind.Row"
    tip=""
    @click="isDescending = !isDescending"
  />
</template>

<style scoped>
/* The filter and the sort's dropdown on an equipment tab, measured off the bag's recording at 1080 high. The
   dropdown is the game's own pill, its list drawn by the browser until its open motion is measured */
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

.sort-select:enabled:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) {
  background-image: linear-gradient(v-bind(GAME_ROW_PRESS), v-bind(GAME_ROW_PRESS));
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

<style scoped src="../../../styles/creamPillLit.css"></style>
<style scoped src="../../../styles/footDisc.css"></style>
