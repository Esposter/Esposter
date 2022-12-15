<script setup lang="ts">
import { useBuildingStore } from "@/store/clicker/useBuildingStore";
import { usePointStore } from "@/store/clicker/usePointStore";
import { usePopupStore } from "@/store/clicker/usePopupStore";
import { storeToRefs } from "pinia";

const pointStore = usePointStore();
const { incrementPoints } = pointStore;
const buildingStore = useBuildingStore();
const { buildingPower } = $(storeToRefs(buildingStore));
const popupStore = usePopupStore();
const { onClick } = popupStore;

let buildingsClickerTimer = $ref<number>();
const buildingsClickerFps = $ref<number>(60);

onMounted(() => {
  buildingsClickerTimer = window.setInterval(
    () => incrementPoints(buildingPower / buildingsClickerFps),
    1000 / buildingsClickerFps
  );
});

onUnmounted(() => clearInterval(buildingsClickerTimer));
</script>

<template>
  <ClickerModelPinaColada
    mt="12"
    width="256"
    height="256"
    :g-attrs="{ class: 'clickable', cursor: 'pointer' }"
    @click="onClick"
  />
</template>
