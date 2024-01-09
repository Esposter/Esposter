<script setup lang="ts">
import { formatNumberLong } from "@/services/clicker/format";
import { useBuildingStore } from "@/store/clicker/building";
import { useGameStore } from "@/store/clicker/game";

const gameStore = useGameStore();
const { game } = storeToRefs(gameStore);
const buildingStore = useBuildingStore();
const { allBuildingPower } = storeToRefs(buildingStore);
const clickerItemProperties = useClickerItemProperties();
const displayNoPointsHtml = computed(() => formatNumberLong(game.value.noPoints, 3).replace(/\s/, "<br/>"));
const displayAllBuildingPower = computed(() => formatNumberLong(allBuildingPower.value));
</script>

<template>
  <div class="text-h3" text-center font-bold select-none>
    <span v-html="displayNoPointsHtml" /> {{ clickerItemProperties.pluralName }}
  </div>
  <div class="text-h5" text-center font-bold select-none>per second: {{ displayAllBuildingPower }}</div>
</template>
