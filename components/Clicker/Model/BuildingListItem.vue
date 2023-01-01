<script setup lang="ts">
import buySfx from "@/assets/clicker/sound/buy.mp3";
import type { Building } from "@/models/clicker";
import { useBuildingStore } from "@/store/clicker/useBuildingStore";
import { useGameStore } from "@/store/clicker/useGameStore";
import { storeToRefs } from "pinia";

interface BuildingListItemProps {
  building: Building;
}

const props = defineProps<BuildingListItemProps>();
const { building } = $(toRefs(props));
const gameStore = useGameStore();
const { game } = $(storeToRefs(gameStore));
const buildingStore = useBuildingStore();
const { getBoughtBuildingLevel, getBuildingPrice, getBuildingStats, createBoughtBuilding } = buildingStore;
const { play } = useSound(buySfx);
const boughtBuildingLevel = $computed(() => getBoughtBuildingLevel(building));
const buildingPrice = $computed(() => getBuildingPrice(building));
const buildingStats = $computed(() => getBuildingStats(building));
const hasBuildingStats = $computed(() => buildingStats.length > 0);
const isAffordable = $computed(() => Boolean(game && game.noPoints >= buildingPrice));
</script>

<template>
  <ClickerModelItemMenu
    :name="building.name"
    :flavor-description="building.flavorDescription"
    :price="buildingPrice"
    :level="boughtBuildingLevel"
  >
    <template v-if="hasBuildingStats" #append-text>
      <ul>
        <li v-for="(buildingStat, index) in buildingStats" :key="index">
          {{ buildingStat }}
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
