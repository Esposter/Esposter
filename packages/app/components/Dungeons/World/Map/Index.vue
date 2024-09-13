<script setup lang="ts">
import type { SceneWithPlugins } from "vue-phaser";

import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";
import Tilemap, { getScene, onCreate, onShutdown, useInjectSceneKey } from "vue-phaser";

const worldSceneStore = useWorldSceneStore();
const { tilemapKey } = storeToRefs(worldSceneStore);
const sceneKey = useInjectSceneKey();
const initializeBounds = (scene: SceneWithPlugins) => {
  if (tilemapKey.value === TilemapKey.Home) scene.cameras.main.setBounds(0, 0, 1280, 2176);
  else scene.cameras.main.removeBounds();
};

onCreate((scene) => {
  initializeBounds(scene);
  scene.cameras.main.setZoom(0.8);
});

watch(tilemapKey, () => {
  const scene = getScene(sceneKey);
  initializeBounds(scene);
});

onShutdown((scene) => {
  scene.cameras.main.removeBounds();
  scene.cameras.main.setZoom(1);
});
</script>

<template>
  <Tilemap
    :configuration="{ key: tilemapKey }"
    @complete="(scene, tilemap) => useCreateTilemapAssets(scene, tilemap)"
  />
</template>
