<script setup lang="ts">
import { useBuildingStore } from "@/store/clicker/useBuildingStore";
import { usePointStore } from "@/store/clicker/usePointStore";
import { ITEM_NAME } from "@/util/constants.client";
import { storeToRefs } from "pinia";

const pointStore = usePointStore();
const { noPoints } = $(storeToRefs(pointStore));
const buildingStore = useBuildingStore();
const { buildingPower } = $(storeToRefs(buildingStore));
const displayBuildingPower = $computed(() => buildingPower.toFixed(1));
</script>

<template>
  <div class="text-h3" text="center" font="bold" select="none">{{ noPoints }} {{ ITEM_NAME }}s</div>
  <div class="text-h5" text="center" font="bold" select="none">per second: {{ displayBuildingPower }}</div>
</template>
