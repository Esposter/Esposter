<script setup lang="ts">
import { formatNumberLong } from "@/services/clicker/format";
import { useBuildingStore } from "@/store/clicker/useBuildingStore";
import { usePointStore } from "@/store/clicker/usePointStore";
import { ITEM_NAME } from "@/util/constants.client";
import { storeToRefs } from "pinia";

const pointStore = usePointStore();
const { noPoints } = $(storeToRefs(pointStore));
const buildingStore = useBuildingStore();
const { allBuildingPower } = $(storeToRefs(buildingStore));
const displayNoPoints = $computed(() => formatNumberLong(noPoints));
const displayAllBuildingPower = $computed(() => formatNumberLong(allBuildingPower));
</script>

<template>
  <div class="text-h3" text="center" font="bold" select="none">{{ displayNoPoints }} {{ ITEM_NAME }}s</div>
  <div class="text-h5" text="center" font="bold" select="none">per second: {{ displayAllBuildingPower }}</div>
</template>
