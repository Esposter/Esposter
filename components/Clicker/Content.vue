<script setup lang="ts">
import { BuildingWithStats, Target } from "@/models/clicker";
import { useBuildingStore } from "@/store/clicker/useBuildingStore";
import { useGameStore } from "@/store/clicker/useGameStore";
import { usePointStore } from "@/store/clicker/usePointStore";
import { usePopupStore } from "@/store/clicker/usePopupStore";
import { AUTOSAVE_INTERVAL, FPS } from "@/util/constants.client";
import { storeToRefs } from "pinia";
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
const boughtBuildingsPower = $computed<{ name: Target; power: number }[]>(() =>
  game.boughtBuildings.map((b) => ({ name: b.name, power: getBoughtBuildingPower(b) }))
);

let buildingsStatsTimers = $ref<number[]>([]);
let buildingsClickerTimer = $ref<number>();
let autosaveTimer = $ref<number>();

const setBuildingStatsTimers = (boughtBuildings: BuildingWithStats[], buildingsPower: typeof boughtBuildingsPower) => {
  for (const boughtBuilding of boughtBuildings) {
    const buildingPower = buildingsPower.find((b) => b.name === boughtBuilding.name);
    if (!buildingPower) return;

    buildingsStatsTimers.push(
      setInterval(() => {
        boughtBuilding.producedValue += buildingPower.power / FPS;
      }, 1000 / FPS)
    );
  }
};

onMounted(() => {
  setBuildingStatsTimers(game.boughtBuildings, boughtBuildingsPower);
  buildingsClickerTimer = setInterval(() => incrementPoints(allBuildingPower / FPS), 1000 / FPS);
  autosaveTimer = setInterval(saveGame, AUTOSAVE_INTERVAL);
});

onUnmounted(() => {
  buildingsStatsTimers.forEach((t) => clearInterval(t));
  buildingsClickerTimer && clearInterval(buildingsClickerTimer);
  autosaveTimer && clearInterval(autosaveTimer);
});

watchEffect(() => {
  buildingsStatsTimers.forEach((t) => clearInterval(t));
  buildingsStatsTimers = [];
  setBuildingStatsTimers(game.boughtBuildings, boughtBuildingsPower);
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
