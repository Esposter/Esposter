<script setup lang="ts">
import { UpgradeName } from "@/models/clicker";
import { useBuildingStore } from "@/store/clicker/useBuildingStore";
import { useGameStore } from "@/store/clicker/useGameStore";
import { usePointStore } from "@/store/clicker/usePointStore";
import { usePopupStore } from "@/store/clicker/usePopupStore";
import { storeToRefs } from "pinia";
import { clearInterval, setInterval } from "worker-timers";

const gameStore = useGameStore();
const { game } = $(storeToRefs(gameStore));
const pointStore = usePointStore();
const { incrementPoints } = pointStore;
const buildingStore = useBuildingStore();
const { buildingPower } = $(storeToRefs(buildingStore));
const popupStore = usePopupStore();
const { onClick } = popupStore;
const cursorAmount = $computed(() => {
  if (!game) return 0;

  const cursorBuilding = game.boughtBuildingList.find((b) => b.name === UpgradeName.Cursor);
  if (cursorBuilding) return cursorBuilding.level;
  return 0;
});

let buildingsClickerTimer = $ref<number>();
const buildingsClickerFps = $ref<number>(60);

onMounted(() => {
  buildingsClickerTimer = setInterval(
    () => incrementPoints(buildingPower / buildingsClickerFps),
    1000 / buildingsClickerFps
  );
});

onUnmounted(() => buildingsClickerTimer && clearInterval(buildingsClickerTimer));
</script>

<template>
  <div mt="12" position="relative">
    <ClickerModelPinaColada
      width="256"
      height="256"
      :g-attrs="{ class: 'clickable', cursor: 'pointer' }"
      @click="onClick"
    />
    <ClickerRotatingCursors :amount="cursorAmount" />
  </div>
</template>
