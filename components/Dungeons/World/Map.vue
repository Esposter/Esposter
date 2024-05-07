<script setup lang="ts">
import Tilemap from "@/lib/phaser/components/Tilemap.vue";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

const worldSceneStore = useWorldSceneStore();
const { tilemapKey } = storeToRefs(worldSceneStore);
</script>

<template>
  <Tilemap
    :configuration="{ key: tilemapKey }"
    @complete="(scene, tilemap) => useCreateTilemapAssets(scene, tilemap)"
  />
</template>
