<script setup lang="ts">
import type { DevRegistry } from "#src/models/dev/DevRegistry";
import type { RegionGround } from "#src/models/world/RegionGround";
import type { TerrainWorkerGround } from "#src/models/world/TerrainWorkerGround";
import type { LightUniforms, TerrainOptions, TerrainSelection, WaterUniforms, WindUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { useTerrainReceive } from "#src/composables/useTerrainReceive";
import { useTerrainResidency } from "#src/composables/useTerrainResidency";
import { useTerrainSelection } from "#src/composables/useTerrainSelection";
import { useTerrainWorkers } from "#src/composables/useTerrainWorkers";
import { useLoop, useTres } from "@tresjs/core";
import {
  checkTerrainTileCasts,
  computeTerrainIndices,
  createFlowerMaterial,
  createTerrainMaterial,
  getTerrainTileLevel,
} from "genshin-engine";
import { BufferAttribute, Group, Mesh, Vector3 } from "three";
import { uniform } from "three/tsl";

interface Props {
  // Starts one of the pool's workers, which the app builds with its bundler from the package's worker entry
  createTerrainWorker: () => Worker;
  // The development registry the settled read is registered with, given in development alone
  devRegistry?: DevRegistry;
  // Written each frame with the tiles drawn, for whatever else reads the ground, such as the grass's capture
  draws: TerrainSelection;
  // Whether every region in reach has arrived or failed, so no ground to lay over the terrain is still coming. The
  // Terrain is not ready before then, since a ground arriving after would rebuild the tiles its first view waited on
  isGroundSettled: boolean;
  lightUniforms: LightUniforms;
  // The world coordinate the scene's origin stands on, which the floating origin moves
  origin: Vector3;
  rampTexture: DataTexture;
  // The regions' grounds laid over Windrise's so far, each as its region first comes within reach
  regionGrounds: RegionGround[];
  // How far from the eye the sun's shadows reach, past which a ring's tiles are drawn into no shadow map
  shadowReach: number;
  terrainOptions: TerrainOptions;
  // The records each worker computes its tiles over, loaded into it as it starts
  terrainWorkerGround: TerrainWorkerGround;
  // The region's water, whose caustics shimmer on the ground under it
  waterUniforms?: WaterUniforms;
  // The wind the flowers scattered on the finest tiles sway in
  windUniforms: WindUniforms;
}

const {
  createTerrainWorker,
  devRegistry,
  draws,
  isGroundSettled,
  lightUniforms,
  origin,
  rampTexture,
  regionGrounds,
  shadowReach,
  terrainOptions,
  terrainWorkerGround,
  waterUniforms,
  windUniforms,
} = defineProps<Props>();
const emit = defineEmits<{ ready: [] }>();
const { camera } = useTres();
const { onBeforeRender } = useLoop();
const { cellsPerSide } = terrainOptions;
const morphEye = uniform(new Vector3());
const terrainMaterial = createTerrainMaterial(terrainOptions, morphEye, { lightUniforms, rampTexture }, waterUniforms);
const tileIndices = computeTerrainIndices(cellsPerSide);
const index = new BufferAttribute(tileIndices, 1);
// Every finest tile's flowers are one instanced draw of the one flower in the one flower material, a child of its tile's
// Mesh, so they show, hide and go with the tile
const flowerMaterial = createFlowerMaterial({ lightUniforms, rampTexture }, windUniforms);
// Every held tile is a mesh in this group, shown only while it is drawn, so a tile coming back into range costs a flag
const tileGroup = new Group();
const checkIsNear = (key: number): boolean => checkTerrainTileCasts(terrainOptions, key, shadowReach);
const workers = useTerrainWorkers({
  createTerrainWorker,
  onTerrainTile: (terrainTile) => {
    receiveTile(terrainTile);
  },
  onTileFailed: (key) => failTile(key),
  terrainWorkerGround,
});
const { disposeTileMesh, endRefresh, failTile, getRing, ringDrawnKeysMap, ringMap, tileStreamer } = useTerrainResidency(
  {
    // The selection is made below, so the residency reads its check through this closure, once the selection exists
    checkIsSettled: () => checkIsSettled(),
    devRegistry,
    postTile: workers.postTile,
    postToEach: workers.postToEach,
    regionGrounds: () => regionGrounds,
    terrainMaterial,
    terrainOptions,
    tileGroup,
    tileIndices,
  },
);
const receiveTile = useTerrainReceive({
  checkIsNear,
  disposeTileMesh,
  failTile,
  flowerMaterial,
  getRing,
  index,
  terrainMaterial,
  terrainOptions,
  tileGroup,
  tileStreamer,
});
const { checkIsSettled, select, settle, shown, viewDraws } = useTerrainSelection({
  draws,
  endRefresh,
  isGroundSettled: () => isGroundSettled,
  onReady: () => emit("ready"),
  terrainOptions,
  tileStreamer,
});

onBeforeRender(() => {
  const activeCamera = camera.value;
  if (!activeCamera) return;
  select(activeCamera, origin);
  // The eye the ground morphs by is written here too, so every pass of the frame draws the ground the view selected
  morphEye.value.setFromMatrixPosition(activeCamera.matrixWorld);
  for (let drawIndex = 0; drawIndex < shown.count; drawIndex++) {
    const tile = tileStreamer.get(shown.keys[drawIndex] ?? 0);
    if (tile instanceof Mesh) tile.visible = false;
  }
  for (const drawnKeys of ringDrawnKeysMap.values()) drawnKeys.length = 0;
  for (let drawIndex = 0; drawIndex < draws.count; drawIndex++) {
    const tile = tileStreamer.get(draws.keys[drawIndex] ?? 0);
    if (tile instanceof Mesh) tile.visible = true;
  }
  for (let drawIndex = 0; drawIndex < viewDraws.count; drawIndex++) {
    const key = viewDraws.keys[drawIndex] ?? 0;
    if (!checkIsNear(key)) ringDrawnKeysMap.get(getTerrainTileLevel(key))?.push(key);
  }
  for (const [level, ring] of ringMap) ring.draw(ringDrawnKeysMap.get(level) ?? []);
  shown.keys.set(draws.keys.subarray(0, draws.count));
  shown.count = draws.count;
  settle();
});

onUnmounted(() => {
  workers.terminate();
  tileStreamer.dispose();
  for (const ring of ringMap.values()) ring.dispose();
  terrainMaterial.dispose();
  flowerMaterial.dispose();
});
</script>

<template>
  <primitive :object="tileGroup" />
</template>
