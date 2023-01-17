<script setup lang="ts">
import { formatNumberLong } from "@/services/clicker/format";
import { useBuildingStore } from "@/store/clicker/useBuildingStore";
import { useGameStore } from "@/store/clicker/useGameStore";
import { ITEM_NAME } from "@/util/constants.client";

const gameStore = useGameStore();
const { game } = $(storeToRefs(gameStore));
const buildingStore = useBuildingStore();
const { allBuildingPower } = $(storeToRefs(buildingStore));
const displayNoPointsHtml = $computed(() => formatNumberLong(game.noPoints).replace(/\s/, "<br/>"));
const displayAllBuildingPower = $computed(() => formatNumberLong(allBuildingPower));
</script>

<template>
  <div class="text-h3" text="center" font="bold" select="none">
    <!-- eslint-disable-next-line vue/no-v-html vue/no-v-text-v-html-on-component -->
    <span v-html="displayNoPointsHtml" /> {{ ITEM_NAME }}s
  </div>
  <div class="text-h5" text="center" font="bold" select="none">per second: {{ displayAllBuildingPower }}</div>
</template>
