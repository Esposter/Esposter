<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { getChestId } from "@/services/dungeons/chest/getChestId";
import { getChestPosition } from "@/services/dungeons/chest/getChestPosition";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

const worldSceneStore = useWorldSceneStore();
const { tilemap, worldData } = storeToRefs(worldSceneStore);
const chestEntries = computed(() =>
  [...worldData.value.chestMap.entries()].map(([id, chest]) => [getChestPosition(id), chest] as const),
);
</script>

<template>
  <Image
    v-for="[position, chest] in chestEntries"
    :key="getChestId(position)"
    :configuration="{
      x: position.x * tilemap.tileWidth,
      y: position.y * tilemap.tileHeight,
      origin: 0,
      texture: TilesetKey.Dungeon,
      frame: 627,
      scale: 4,
    }"
  />
</template>
