<script setup lang="ts">
import type { Building } from "#shared/models/clicker/data/building/Building";

import { ItemType } from "#shared/models/clicker/data/ItemType";
import { Sound } from "@/models/clicker/Sound";
import { useClickerStore } from "@/store/clicker";
import { useBuildingStore } from "@/store/clicker/building";
import { marked } from "marked";

interface BuildingListItemProps {
  building: Building;
}

const { building } = defineProps<BuildingListItemProps>();
const clickerStore = useClickerStore();
const { clicker } = storeToRefs(clickerStore);
const buildingStore = useBuildingStore();
const { createBoughtBuilding, getBoughtBuildingAmount, getBoughtBuildingStats, getBuildingPrice } = buildingStore;
const { play } = useClickerSound(Sound.Buy);
const boughtBuildingAmount = computed(() => getBoughtBuildingAmount(building));
const buildingStatsHtml = computed(() => getBoughtBuildingStats(building).map((s) => marked.parse(s)));
const hasBuildingStatsHtml = computed(() => buildingStatsHtml.value.length > 0);
const buildingPrice = computed(() => getBuildingPrice(building));
const isAffordable = computed(() => clicker.value.noPoints >= buildingPrice.value);
const displayFlavorDescription = useDecompileString(building.flavorDescription);
</script>

<template>
  <!-- We can assume that buildings will always be displayed in store section for better UX -->
  <ClickerModelItemMenu
    :id="building.id"
    :type="ItemType.Building"
    :is-affordable
    :menu-props="{ location: 'right center' }"
    :flavor-description="displayFlavorDescription"
    :price="buildingPrice"
    :amount="boughtBuildingAmount"
  >
    <template v-if="hasBuildingStatsHtml" #append-text>
      <div px-8>
        <div v-for="(buildingStatHtml, index) of buildingStatsHtml" :key="index" rd mt-1 px-1>
          <div v-html="buildingStatHtml" />
        </div>
      </div>
    </template>
    <template #action>
      <v-spacer />
      <StyledButton
        :button-props="{
          disabled: !isAffordable,
        }"
        @click="
          () => {
            createBoughtBuilding(building);
            play();
          }
        "
      >
        Buy
      </StyledButton>
    </template>
  </ClickerModelItemMenu>
</template>

<style scoped lang="scss">
.list-item:last-of-type {
  margin-bottom: 0.25rem;
}
</style>
