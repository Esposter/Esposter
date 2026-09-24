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
  <div text-center select-none>
    <p ui-display><span v-html="displayPointCountHtml" /> {{ clickerItemProperties.pluralName }}</p>
    <p text-muted>per second: {{ displayAllBuildingPower }}</p>
  </div>
</template>
