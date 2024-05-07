<script setup lang="ts">
import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import { getScene } from "@/lib/phaser/util/getScene";
import { getChestId } from "@/services/dungeons/chest/getChestId";
import { getChestPosition } from "@/services/dungeons/chest/getChestPosition";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import type { Tilemaps } from "phaser";

const sceneKey = useInjectSceneKey();
const worldSceneStore = useWorldSceneStore();
const { tilemapKey, worldData } = storeToRefs(worldSceneStore);
const chestEntries = computed(() =>
  [...worldData.value.chestMap.entries()].map(([id, chest]) => [getChestPosition(id), chest] as const),
);
const tilemap = computed<Tilemaps.Tilemap>(() => getScene(sceneKey).cache.tilemap.get(tilemapKey.value));
</script>

<template>
  <DungeonsWorldChest
    v-for="[position, chest] in chestEntries"
    :key="getChestId(position)"
    :position="{
      x: position.x * tilemap.tileWidth,
      y: position.y * tilemap.tileHeight,
    }"
    :chest
  />
</template>
