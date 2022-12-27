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
const { createBoughtBuilding, getBuildingPrice, getBoughtBuildingLevel } = buildingStore;
const { play } = useSound(buySfx);
const boughtBuildingLevel = $computed(() => getBoughtBuildingLevel(building));
const buildingPrice = $computed(() => getBuildingPrice(building));
const isAffordable = $computed(() => Boolean(game && game.noPoints >= buildingPrice));
</script>

<template>
  <ClickerModelItemMenu
    :name="building.name"
    :flavor-description="building.flavorDescription"
    :price="buildingPrice"
    :level="boughtBuildingLevel"
    :is-affordable="isAffordable"
    is-buyable
    @buy="
      () => {
        createBoughtBuilding(building);
        play();
      }
    "
  />
</template>
