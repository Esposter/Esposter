<script setup lang="ts">
import type { Building } from "#shared/models/clicker/data/building/Building";
import type { ClickerListItem } from "@/models/clicker/ClickerListItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { STORE_ITEM_POSITION_AREA } from "@/services/clicker/constants";
import { BuildingIconMap } from "@/services/clicker/icon/BuildingIconMap";
import { useClickerStore } from "@/store/clicker";
import { useBuildingStore } from "@/store/clicker/building";
import { takeOne } from "@esposter/shared";

interface Props {
  buildings: Building[];
}

const { buildings } = defineProps<Props>();
const clickerStore = useClickerStore();
const { clicker } = storeToRefs(clickerStore);
const buildingStore = useBuildingStore();
const { getBoughtBuildingAmount, getBuildingPriceForQuantity } = buildingStore;
const { buyQuantity } = storeToRefs(buildingStore);
// Each building at the price of the quantity the store buys at, against what the player has
const items = computed(() =>
  buildings.map<ClickerListItem>((building) => {
    const price = getBuildingPriceForQuantity(building, buyQuantity.value);
    return {
      amount: getBoughtBuildingAmount(building),
      id: building.id,
      image: BuildingIconMap[building.id],
      isAffordable: clicker.value.pointCount >= price,
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
      <template #detail="{ id }">
        <ClickerModelBuildingDetail
          :building="
            takeOne(
              buildings,
              buildings.findIndex((building) => building.id === id),
            )
          "
        />
      </template>
    </ClickerModelItemList>
  </ClickerModelListGroup>
</template>
