<script setup lang="ts">
import { Target } from "@/models/clicker";
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
const { buildingPower } = $(storeToRefs(buildingStore));
const popupStore = usePopupStore();
const { onClick } = popupStore;
const cursorAmount = $computed(() => {
  if (!game) return 0;

  const cursorBuilding = game.boughtBuildings.find((b) => b.name === Target.Cursor);
  if (cursorBuilding) return cursorBuilding.level;
  return 0;
});

let buildingsClickerTimer = $ref<number>();
let autosaveTimer = $ref<number>();

onMounted(() => {
  buildingsClickerTimer = setInterval(() => incrementPoints(buildingPower / FPS), 1000 / FPS);
  autosaveTimer = setInterval(saveGame, AUTOSAVE_INTERVAL);
});

onUnmounted(() => {
  buildingsClickerTimer && clearInterval(buildingsClickerTimer);
  autosaveTimer && clearInterval(autosaveTimer);
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
