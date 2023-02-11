<script setup lang="ts">
import buySfx from "@/assets/clicker/sound/buy.mp3";
import type { Building } from "@/models/clicker";
import { ItemType } from "@/models/clicker";
import { useBuildingStore } from "@/store/clicker/useBuildingStore";
import { useGameStore } from "@/store/clicker/useGameStore";
import { marked } from "marked";

interface BuildingListItemProps {
  building: Building;
}

const props = defineProps<BuildingListItemProps>();
const { building } = $(toRefs(props));
const gameStore = useGameStore();
const { game } = $(storeToRefs(gameStore));
const buildingStore = useBuildingStore();
const { getBoughtBuildingAmount, getBoughtBuildingStats, getBuildingPrice, createBoughtBuilding } = buildingStore;
const { play } = useSound(buySfx);
const boughtBuildingAmount = $computed(() => getBoughtBuildingAmount(building));
const buildingStatsHtml = $computed(() => getBoughtBuildingStats(building).map((s) => marked.parse(s)));
const hasBuildingStatsHtml = $computed(() => buildingStatsHtml.length > 0);
const buildingPrice = $computed(() => getBuildingPrice(building));
const isAffordable = $computed(() => Boolean(game && game.noPoints >= buildingPrice));
</script>

<template>
  <ClickerModelItemMenu
    :type="ItemType.Building"
    :name="building.name"
    :flavor-description="building.flavorDescription"
    :price="buildingPrice"
    :amount="boughtBuildingAmount"
  >
    <template v-if="hasBuildingStatsHtml" #append-text>
      <ul px="8">
        <li v-for="(buildingStatHtml, index) in buildingStatsHtml" :key="index" class="list-item" mt="1" px="1" rd="1">
          <!-- eslint-disable-next-line vue/no-v-html vue/no-v-text-v-html-on-component -->
          <div v-html="buildingStatHtml" />
        </li>
      </ul>
    </template>
    <template #action>
      <v-spacer />
      <StyledButton
        :button-props="{ disabled: !isAffordable }"
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
