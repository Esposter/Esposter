<script setup lang="ts">
import { TilemapForegroundFileKeyMap } from "@/services/dungeons/scene/world/TilemapForegroundFileKeyMap";
import { useWorldPlayerStore } from "@/store/dungeons/world/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { Image } from "vue-phaserjs";

const worldSceneStore = useWorldSceneStore();
const { tilemapKey } = storeToRefs(worldSceneStore);
const worldPlayerStore = useWorldPlayerStore();
const { sprite } = storeToRefs(worldPlayerStore);
</script>

<template>
  <!-- Foreground sits above the player so they can hide behind it. -->
  <Image
    :configuration="{
      origin: 0,
      texture: TilemapForegroundFileKeyMap[tilemapKey],
      depth: sprite ? sprite.depth + 1 : 0,
    }"
  />
</template>
