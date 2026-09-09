<script setup lang="ts">
import type { WorldForegroundKey } from "#shared/models/dungeons/keys/image/world/WorldForegroundKey";

import { ImageKeys } from "#shared/models/dungeons/keys/image/ImageKey";
import { useWorldPlayerStore } from "@/store/dungeons/world/player";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import { Image } from "vue-phaserjs";

const worldSceneStore = useWorldSceneStore();
const { tilemapKey } = storeToRefs(worldSceneStore);
const texture = computed(() => {
  const foregroundTextureKey: WorldForegroundKey = `World${tilemapKey.value}Foreground`;
  return ImageKeys.has(foregroundTextureKey) ? foregroundTextureKey : undefined;
});
const worldPlayerStore = useWorldPlayerStore();
const { sprite } = storeToRefs(worldPlayerStore);
</script>

<template>
  <!-- Foreground sits above the player so they can hide behind it. -->
  <Image v-if="texture" :configuration="{ origin: 0, texture, depth: sprite ? sprite.depth + 1 : 0 }" />
</template>
