<script setup lang="ts">
import type { Tilemaps } from "phaser";
import type { SceneWithPlugins } from "vue-phaserjs";

import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { createTilemapAssets } from "#src/services/dungeons/tilemap/createTilemapAssets";
import { useWorldSceneStore } from "#src/store/dungeons/world/scene";
import { onCreate, onShutdown, Tilemap } from "vue-phaserjs";

const worldSceneStore = useWorldSceneStore();
const { releaseGridEngine } = worldSceneStore;
const { tilemapKey } = storeToRefs(worldSceneStore);
// Runs on every tilemap the component builds, so the bounds follow the tilemap's own size rather than a number kept
// Here
const initializeBounds = (scene: SceneWithPlugins, tilemap: Tilemaps.Tilemap) => {
  if (tilemapKey.value === TilemapKey.Home)
    scene.cameras.main.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);
  else scene.cameras.main.removeBounds();
};

onCreate((scene) => {
  scene.cameras.main.setZoom(0.8);
});

onShutdown((scene) => {
  scene.cameras.main.removeBounds();
  scene.cameras.main.setZoom(1);
  // The tilemap's grid engine is released with the scene, and the next tilemap makes its own
  releaseGridEngine();
});
</script>

<template>
  <Tilemap
    :configuration="{ key: tilemapKey }"
    @complete="
      (scene, tilemap) => {
        createTilemapAssets(tilemap);
        initializeBounds(scene, tilemap);
      }
    "
  />
</template>
