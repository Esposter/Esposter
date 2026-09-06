<script setup lang="ts">
import type { Building } from "#shared/models/clicker/data/building/Building";

import { ItemType } from "#shared/models/clicker/data/ItemType";
import { Sound } from "@/models/clicker/Sound";
import { useClickerStore } from "@/store/clicker";
import { useBuildingStore } from "@/store/clicker/building";
import { marked } from "marked";

interface Props {
  building: Building;
}

const { building } = defineProps<Props>();
const clickerStore = useClickerStore();
const { clicker } = storeToRefs(clickerStore);
const buildingStore = useBuildingStore();
const { createBoughtBuilding, getBoughtBuildingAmount, getBoughtBuildingStatistics, getBuildingPriceForQuantity } =
  buildingStore;
const { buyQuantity } = storeToRefs(buildingStore);
const { play } = useClickerSound(Sound.Buy);
const buildingStatsHtml = computed(() =>
  getBoughtBuildingStatistics(building).map((s) => marked.parse(s, { async: false })),
);
const buildingPrice = computed(() => getBuildingPriceForQuantity(building, buyQuantity.value));
const isAffordable = computed(() => clicker.value.pointCount >= buildingPrice.value);
const amount = computed(() => getBoughtBuildingAmount(building));
const displayFlavorDescription = useDecompileString(building.flavorDescription);
</script>

<template>
  <!-- The store column is the only place a building renders, so the menu can always open to its right -->
  <ClickerModelItemMenu
    :id="building.id"
    :type="ItemType.Building"
    :is-affordable
    :menu-props="{ location: 'right center' }"
    :flavor-description="displayFlavorDescription"
    :price="buildingPrice"
    :amount
  >
    <template v-if="buildingStatsHtml.length > 0" #append-text>
      <div
        v-for="(buildingStatHtml, index) of buildingStatsHtml"
        :key="index"
        mx-8
        mt-1
        px-1
        rd
        v-html="buildingStatHtml"
      />
    </template>
    <template #action>
      <v-spacer />
      <StyledButton
        :button-props="{ disabled: !isAffordable, text: 'Buy' }"
        @click="
          () => {
            createBoughtBuilding(building, buyQuantity);
            play();
          }
        "
      />
    </template>
  </ClickerModelItemMenu>
</template>
