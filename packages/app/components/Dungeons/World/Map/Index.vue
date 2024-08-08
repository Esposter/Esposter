<script setup lang="ts">
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import Tilemap from "@/lib/phaser/components/Tilemap.vue";
import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import { getScene } from "@/lib/phaser/util/getScene";
import { useWorldSceneStore } from "@/store/dungeons/world/scene";

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
