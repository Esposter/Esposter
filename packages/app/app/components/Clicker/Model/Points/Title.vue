<script setup lang="ts">
import { formatNumberLong } from "@/services/clicker/formatNumberLong";
import { useClickerStore } from "@/store/clicker";
import { useBuildingStore } from "@/store/clicker/building";

const clickerStore = useClickerStore();
const { clicker, clickerItemProperties } = storeToRefs(clickerStore);
const buildingStore = useBuildingStore();
const { allBuildingPower } = storeToRefs(buildingStore);
const displayPointCountHtml = computed(() =>
  formatNumberLong(clicker.value.pointCount, 3).replaceAll(/\s/gu, "<br />"),
);
const displayAllBuildingPower = computed(() => formatNumberLong(allBuildingPower.value));
</script>

<template>
  <div font-bold text-center select-none text-display-medium>
    <span v-html="displayPointCountHtml" /> {{ clickerItemProperties.pluralName }}
  </div>
  <div font-bold text-center select-none text-headline-small>per second: {{ displayAllBuildingPower }}</div>
</template>
