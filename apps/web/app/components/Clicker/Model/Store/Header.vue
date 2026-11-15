<script setup lang="ts">
import type { UiMenuItem } from "#src/models/ui/UiMenuItem";

import { BUY_QUANTITIES } from "#src/services/clicker/constants";
import { useBuildingStore } from "#src/store/clicker/building";

const buildingStore = useBuildingStore();
const { buyQuantity } = storeToRefs(buildingStore);
const buyQuantityItems = BUY_QUANTITIES.map<UiMenuItem<number>>((quantity) => ({
  title: `×${quantity}`,
  value: quantity,
}));
</script>

<template>
  <header px-4 pb-2 pt-4 flex gap-2 items-center>
    <h2 flex-1 truncate ui-title>Store</h2>
    <UiToggleGroup v-model="buyQuantity" :items="buyQuantityItems" label="Buy quantity" />
  </header>
</template>
