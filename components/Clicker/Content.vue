<script setup lang="ts">
import type { BuildingWithStats } from "@/models/clicker";
import { Target } from "@/models/clicker";
import { useBuildingStore } from "@/store/clicker/useBuildingStore";
import { useGameStore } from "@/store/clicker/useGameStore";
import { usePointStore } from "@/store/clicker/usePointStore";
import { usePopupStore } from "@/store/clicker/usePopupStore";
import { clearInterval, setInterval } from "worker-timers";

const gameStore = useGameStore();
const { saveGame } = gameStore;
const { game } = $(storeToRefs(gameStore));
const pointStore = usePointStore();
const { incrementPoints } = pointStore;
const buildingStore = useBuildingStore();
const { getBoughtBuildingPower } = buildingStore;
const { allBuildingPower } = $(storeToRefs(buildingStore));
const popupStore = usePopupStore();
const { onClick } = popupStore;
const cursorAmount = $computed(() => {
  const cursorBuilding = game.boughtBuildings.find((b) => b.name === Target.Cursor);
  return cursorBuilding?.amount ?? 0;
});
const boughtBuildingPowers = $computed<{ name: Target; power: number }[]>(() =>
  game.boughtBuildings.map((b) => ({ name: b.name, power: getBoughtBuildingPower(b) }))
);

let buildingStatsTimers = $ref<number[]>([]);
let buildingClickerTimer = $ref<number>();
let autosaveTimer = $ref<number>();

const setBuildingStatsTimers = (boughtBuildings: BuildingWithStats[], buildingPowers: typeof boughtBuildingPowers) => {
  for (const boughtBuilding of boughtBuildings) {
    const buildingPower = buildingPowers.find((b) => b.name === boughtBuilding.name);
    if (!buildingPower) return;

    buildingStatsTimers.push(
      setInterval(() => {
        boughtBuilding.producedValue += buildingPower.power / FPS;
      }, 1000 / FPS)
    );
  }
};

onMounted(() => {
  setBuildingStatsTimers(game.boughtBuildings, boughtBuildingPowers);
  buildingClickerTimer = setInterval(() => incrementPoints(allBuildingPower / FPS), 1000 / FPS);
  autosaveTimer = setInterval(saveGame, AUTOSAVE_INTERVAL);
});

onUnmounted(() => {
  buildingStatsTimers.forEach((t) => clearInterval(t));
  buildingClickerTimer && clearInterval(buildingClickerTimer);
  autosaveTimer && clearInterval(autosaveTimer);
});

watchEffect(() => {
  buildingStatsTimers.forEach((t) => clearInterval(t));
  buildingStatsTimers = [];
  setBuildingStatsTimers(game.boughtBuildings, boughtBuildingPowers);
});
</script>

<template>
  <div mt="12" position="relative">
    <ClickerRotatingCursors :amount="cursorAmount" />
    <ClickerModelPinaColada
      position="relative"
      width="256"
      height="256"
      :g-attrs="{ class: 'clickable', cursor: 'pointer' }"
      @click="onClick"
    />
  </div>
</template>

<style scoped lang="scss">
:deep(.clickable:active) {
  transform: $clickShrink;
  transform-origin: center;
}
</style>
