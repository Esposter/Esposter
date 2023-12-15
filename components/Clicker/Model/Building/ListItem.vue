<script setup lang="ts">
import buySfx from "@/assets/clicker/sound/buy.mp3";
import { type Building } from "@/models/clicker/Building";
import { ItemType } from "@/models/clicker/ItemType";
import { useBuildingStore } from "@/store/clicker/building";
import { useGameStore } from "@/store/clicker/game";
import { marked } from "marked";

interface BuildingListItemProps {
  building: Building;
}

const { building } = defineProps<BuildingListItemProps>();
const gameStore = useGameStore();
const { game } = storeToRefs(gameStore);
const buildingStore = useBuildingStore();
const { getBoughtBuildingAmount, getBoughtBuildingStats, getBuildingPrice, createBoughtBuilding } = buildingStore;
const { play } = useSound(buySfx);
const boughtBuildingAmount = computed(() => getBoughtBuildingAmount(building));
const buildingStatsHtml = computed(() => getBoughtBuildingStats(building).map((s) => marked.parse(s)));
const hasBuildingStatsHtml = computed(() => buildingStatsHtml.value.length > 0);
const buildingPrice = computed(() => getBuildingPrice(building));
const isAffordable = computed(() => Boolean(game.value && game.value.noPoints >= buildingPrice.value));
</script>

<template>
  <!-- We can assume that buildings will always be displayed in store section for better UX -->
  <ClickerModelItemMenu
    :type="ItemType.Building"
    :is-affordable="isAffordable"
    :menu-props="{ location: 'right center' }"
    :name="building.name"
    :flavor-description="building.flavorDescription"
    :price="buildingPrice"
    :amount="boughtBuildingAmount"
  >
    <template v-if="hasBuildingStatsHtml" #append-text>
      <ul px-8>
        <li v-for="(buildingStatHtml, index) in buildingStatsHtml" :key="index" class="list-item" mt-1 px-1 rd>
          <div v-html="buildingStatHtml" />
        </li>
      </ul>
    </template>
    <template #action>
      <v-spacer />
      <StyledButton
        :disabled="!isAffordable"
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
