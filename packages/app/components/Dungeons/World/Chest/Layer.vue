<script setup lang="ts">
import { getChestPosition } from "@/services/dungeons/chest/getChestPosition";
import { ExternalWorldSceneStore, useWorldSceneStore } from "@/store/dungeons/world/scene";
import { getPositionId } from "@/util/id/getPositionId";

const worldSceneStore = useWorldSceneStore();
const { worldData } = storeToRefs(worldSceneStore);
const chestEntries = computed(() =>
  [...worldData.value.chestMap.entries()].map(([id, chest]) => [getChestPosition(id), chest] as const),
);
</script>

<template>
  <DungeonsWorldChest
    v-for="[position, chest] in chestEntries"
    :key="getPositionId(position)"
    :position="{
      x: position.x * ExternalWorldSceneStore.tilemap.tileWidth,
      y: position.y * ExternalWorldSceneStore.tilemap.tileHeight,
    }"
    :chest="chest"
  />
</template>
