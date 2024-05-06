<script setup lang="ts">
import Tilemap from "@/lib/phaser/components/Tilemap.vue";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

const worldSceneStore = useWorldSceneStore();
const { worldData } = storeToRefs(worldSceneStore);
</script>

<template>
  <Tilemap
    :configuration="{ key: worldData.tilemapKey }"
    @complete="(_scene, tilemap) => useCreateTilemapAssets(tilemap)"
  />
</template>
