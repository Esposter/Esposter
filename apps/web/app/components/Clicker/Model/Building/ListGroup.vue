<script setup lang="ts">
import type { Building } from "#shared/models/clicker/data/building/Building";
import type { ClickerBuildingListItem } from "@/models/clicker/ClickerBuildingListItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { STORE_ITEM_POSITION_AREA } from "@/services/clicker/constants";
import { BuildingIconMap } from "@/services/clicker/icon/BuildingIconMap";
import { useBuildingStore } from "@/store/clicker/building";
import { usePointStore } from "@/store/clicker/point";

interface Props {
  buildings: Building[];
}

const { buildings } = defineProps<Props>();
const pointStore = usePointStore();
const { checkIsAffordable } = pointStore;
const buildingStore = useBuildingStore();
const { getBoughtBuildingAmount, getBuildingPriceForQuantity } = buildingStore;
const { buyQuantity } = storeToRefs(buildingStore);
// Each building at the price of the quantity the store buys at, against what the player has
const items = computed(() =>
  buildings.map<ClickerBuildingListItem>((building) => {
    const price = getBuildingPriceForQuantity(building, buyQuantity.value);
    return {
      amount: getBoughtBuildingAmount(building),
      building,
      id: building.id,
      image: BuildingIconMap[building.id],
      isAffordable: checkIsAffordable(price),
      price,
    };
  }),
);
</script>

<template>
  <ClickerModelListGroup
    v-if="buildings.length > 0"
    :count="buildings.length"
    :meaning="UiIconMeaning.Building"
    title="Buildings"
  >
    <ClickerModelItemList :items label="Buildings" :position-area="STORE_ITEM_POSITION_AREA">
      <template #detail="{ item }">
        <ClickerModelBuildingDetail :building="item.building" />
      </template>
    </ClickerModelItemList>
  </ClickerModelListGroup>
</template>
