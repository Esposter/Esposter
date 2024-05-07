<script setup lang="ts">
import { getChestId } from "@/services/dungeons/chest/getChestId";
import { getChestPosition } from "@/services/dungeons/chest/getChestPosition";
import { ExternalWorldSceneStore, useWorldSceneStore } from "@/store/dungeons/world/scene";

const worldSceneStore = useWorldSceneStore();
const { worldData } = storeToRefs(worldSceneStore);
const chestEntries = computed(() =>
  [...worldData.value.chestMap.entries()].map(([id, chest]) => [getChestPosition(id), chest] as const),
);
</script>

<template>
  <DungeonsWorldChest
    v-for="[position, chest] in chestEntries"
    :key="getChestId(position)"
    :position="{
      x: position.x * ExternalWorldSceneStore.tilemap.tileWidth,
      y: position.y * ExternalWorldSceneStore.tilemap.tileHeight,
    }"
    :chest
  />
</template>
