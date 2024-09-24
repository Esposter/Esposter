<script setup lang="ts">
import { getChestPosition } from "@/services/dungeons/chest/getChestPosition";
import { getPositionId } from "@/services/dungeons/direction/getPositionId";
import { ExternalWorldSceneStore, useWorldSceneStore } from "@/store/dungeons/world/scene";

const worldSceneStore = useWorldSceneStore();
const { worldData } = storeToRefs(worldSceneStore);
const chestEntries = computed(() =>
  Object.entries(worldData.value.chestMap).map(([id, chest]) => [getChestPosition(id), chest] as const),
);
</script>

<template>
  <DungeonsWorldChest
    v-for="[position, chest] of chestEntries"
    :key="getPositionId(position)"
    :position="{
      x: position.x * ExternalWorldSceneStore.tilemap.tileWidth,
      y: position.y * ExternalWorldSceneStore.tilemap.tileHeight,
    }"
    :chest
  />
</template>
