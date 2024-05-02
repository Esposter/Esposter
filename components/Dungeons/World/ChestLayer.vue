<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { TilesetKey } from "@/models/dungeons/keys/TilesetKey";
import { getChestId } from "@/services/dungeons/chest/getChestId";
import { getChestPosition } from "@/services/dungeons/chest/getChestPosition";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

const worldSceneStore = useWorldSceneStore();
const { worldData } = storeToRefs(worldSceneStore);
const chestEntries = computed(() =>
  [...worldData.value.chestMap.entries()].map(([id, chest]) => [getChestPosition(id), chest] as const),
);
</script>

<template>
  <Image
    v-for="[position, chest] in chestEntries"
    :key="getChestId(position)"
    :configuration="{ ...position, origin: 0, texture: TilesetKey.HouseInterior, frame: 22 }"
  />
</template>
