<script setup lang="ts">
import type { Building } from "#shared/models/clicker/data/building/Building";

import { ItemType } from "#shared/models/clicker/data/ItemType";
import { Sound } from "@/models/clicker/Sound";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { STORE_ITEM_POSITION_AREA } from "@/services/clicker/constants";
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
  <ClickerModelItemMenu
    :id="building.id"
    :type="ItemType.Building"
    :is-affordable
    :position-area="STORE_ITEM_POSITION_AREA"
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
  </ClickerModelItemMenu>
</template>
