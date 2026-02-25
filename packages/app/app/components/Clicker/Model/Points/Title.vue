<script setup lang="ts">
import { formatNumberLong } from "@/services/clicker/format";
import { useClickerStore } from "@/store/clicker";
import { useBuildingStore } from "@/store/clicker/building";

const clickerStore = useClickerStore();
const { clicker } = storeToRefs(clickerStore);
const buildingStore = useBuildingStore();
const { allBuildingPower } = storeToRefs(buildingStore);
const clickerItemProperties = useClickerItemProperties();
const displayNoPointsHtml = computed(() => formatNumberLong(clicker.value.noPoints, 3).replaceAll(/\s/g, "<br />"));
const displayAllBuildingPower = computed(() => formatNumberLong(allBuildingPower.value));
</script>

<template>
  <div class="text-display-medium" text-center font-bold select-none>
    <span v-html="displayNoPointsHtml" /> {{ clickerItemProperties.pluralName }}
  </div>
  <div class="text-headline-small" text-center font-bold select-none>per second: {{ displayAllBuildingPower }}</div>
</template>
