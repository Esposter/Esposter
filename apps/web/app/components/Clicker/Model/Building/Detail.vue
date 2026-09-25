<script setup lang="ts">
import type { Building } from "#shared/models/clicker/data/building/Building";

import { ItemType } from "#shared/models/clicker/data/ItemType";
import { Sound } from "@/models/clicker/Sound";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { useBuildingStore } from "@/store/clicker/building";
import { usePointStore } from "@/store/clicker/point";
import { marked } from "marked";

interface Props {
  building: Building;
}

const { building } = defineProps<Props>();
const pointStore = usePointStore();
const { checkIsAffordable } = pointStore;
const buildingStore = useBuildingStore();
const { createBoughtBuilding, getBoughtBuildingAmount, getBoughtBuildingStatistics, getBuildingPriceForQuantity } =
  buildingStore;
const { buyQuantity } = storeToRefs(buildingStore);
const { play } = useClickerSound(Sound.Buy);
const buildingStatsHtml = computed(() =>
  getBoughtBuildingStatistics(building).map((statistic) => marked.parse(statistic, { async: false })),
);
const buildingPrice = computed(() => getBuildingPriceForQuantity(building, buyQuantity.value));
const isAffordable = computed(() => checkIsAffordable(buildingPrice.value));
const amount = computed(() => getBoughtBuildingAmount(building));
const displayFlavorDescription = useDecompileString(building.flavorDescription);
</script>

<template>
  <ClickerModelItemDetail
    :id="building.id"
    :type="ItemType.Building"
    :is-affordable
    :flavor-description="displayFlavorDescription"
    :price="buildingPrice"
    :amount
  >
    <template v-if="buildingStatsHtml.length > 0" #append-text>
      <div text-sm flex flex-col gap-1>
        <div v-for="(buildingStatHtml, index) of buildingStatsHtml" :key="index" v-html="buildingStatHtml" />
      </div>
    </template>
    <template #action>
      <UiButton
        :disabled="!isAffordable"
        :variant="UiButtonVariant.Accent"
        @click="
          () => {
            createBoughtBuilding(building, buyQuantity);
            play();
          }
        "
      >
        Buy ×{{ buyQuantity }}
      </UiButton>
    </template>
  </ClickerModelItemDetail>
</template>
