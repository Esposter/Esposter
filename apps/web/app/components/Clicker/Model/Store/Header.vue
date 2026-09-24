<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { BUY_QUANTITIES } from "@/services/clicker/constants";
import { useBuildingStore } from "@/store/clicker/building";

const buildingStore = useBuildingStore();
const { buyQuantity } = storeToRefs(buildingStore);
// A toggle group chooses between strings, and the store buys by number
const buyQuantityItems = BUY_QUANTITIES.map<UiMenuItem<string>>((quantity) => ({
  title: `×${quantity}`,
  value: String(quantity),
}));
const selectedBuyQuantity = computed({
  get: () => String(buyQuantity.value),
  set: (value) => {
    buyQuantity.value = Number(value);
  },
});
</script>

<template>
  <header px-4 pb-2 pt-4 flex gap-2 items-center>
    <h2 flex-1 truncate ui-title>Store</h2>
    <UiToggleGroup v-model="selectedBuyQuantity" :items="buyQuantityItems" label="Buy quantity" />
  </header>
</template>
