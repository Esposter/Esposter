<script setup lang="ts">
import { useLoop, useTres } from "@tresjs/core";
import type { TerrainTileRequest } from "#src/models/TerrainTileRequest";
import type { LightUniforms, TerrainOptions, TerrainTile, WaterUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import {
  MAX_CACHED_TILE_COUNT,
  MAX_PENDING_TILE_COUNT,
  TERRAIN_WORKER_COUNT,
  TILE_SELECTION_CAPACITY,
} from "#src/services/constants";
import {
  computeTerrainIndices,
  createTerrainMaterial,
  createTerrainSelection,
  createTerrainTileGeometry,
  createTileStreamer,
  getTerrainTileColumn,
  getTerrainTileLevel,
  getTerrainTileRow,
  resolveTerrainDraws,
  selectTerrainTiles,
  TERRAIN_LAYER,
} from "genshin-engine";
import { BufferAttribute, Frustum, Group, Matrix4, Mesh, Vector3 } from "three";

interface Props {
  // Starts one of the pool's workers, which the app builds with its bundler from the package's worker entry
  createTerrainWorker: () => Worker;
  lightUniforms: LightUniforms;
  // The world coordinate the scene's origin stands on, which the floating origin moves
  origin: Vector3;
  rampTexture: DataTexture;
  terrainOptions: TerrainOptions;
  // The region's water, whose caustics shimmer on the ground under it
  waterUniforms?: WaterUniforms;
}

const { createTerrainWorker, lightUniforms, origin, rampTexture, terrainOptions, waterUniforms } = defineProps<Props>();
const emit = defineEmits<{ change: [] }>();
const { camera } = useTres();
const { onBeforeRender } = useLoop();
const { cellsPerSide, finestTileSize } = terrainOptions;
const terrainMaterial = createTerrainMaterial(terrainOptions, { lightUniforms, rampTexture }, waterUniforms);
const index = new BufferAttribute(computeTerrainIndices(cellsPerSide), 1);
// Every held tile is a mesh in this group, shown only while it is drawn, so a tile coming back into view costs a flag
const tileGroup = new Group();
const workers = Array.from({ length: TERRAIN_WORKER_COUNT }, createTerrainWorker);
let requestCount = 0;
const tileStreamer = createTileStreamer<Mesh>({
  disposeTile: (mesh) => {
    tileGroup.remove(mesh);
    mesh.geometry.dispose();
  },
  maxCachedCount: MAX_CACHED_TILE_COUNT,
  maxPendingCount: MAX_PENDING_TILE_COUNT,
  requestTile: (key) => {
    const request: TerrainTileRequest = { cellsPerSide, finestTileSize, key };
    workers[requestCount % workers.length]?.postMessage(request);
    requestCount++;
  },
});
const receiveTile = (event: MessageEvent<TerrainTile>) => {
  const terrainTile = event.data;
  const { key } = terrainTile;
  const size = finestTileSize * 2 ** getTerrainTileLevel(key);
  const mesh = new Mesh(createTerrainTileGeometry(terrainTile, index), terrainMaterial);
  mesh.position.set(getTerrainTileColumn(key) * size, 0, getTerrainTileRow(key) * size);
  mesh.matrixAutoUpdate = false;
  mesh.updateMatrix();
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.layers.enable(TERRAIN_LAYER);
  mesh.visible = false;
  tileGroup.add(mesh);
  tileStreamer.receive(key, mesh);
  emit("change");
};
for (const worker of workers) worker.addEventListener("message", receiveTile);
const checkTileLoaded = (key: number) => tileStreamer.has(key);
const wanted = createTerrainSelection(TILE_SELECTION_CAPACITY);
const draws = createTerrainSelection(TILE_SELECTION_CAPACITY);
const shown = createTerrainSelection(TILE_SELECTION_CAPACITY);
const eye = new Vector3();
const originMatrix = new Matrix4();
const viewProjection = new Matrix4();
const frustum = new Frustum();
// Each frame the quadtree is walked from the eye's world position, what is missing is asked for, and the tiles to
// Draw are shown in place of last frame's. The frustum is built in world coordinates, the scene's view moved by the
// Origin, so the selection never sees the floating origin
onBeforeRender(() => {
  const activeCamera = camera.value;
  if (!activeCamera) return;
  eye.copy(activeCamera.position).add(origin);
  originMatrix.makeTranslation(-origin.x, -origin.y, -origin.z);
  viewProjection
    .multiplyMatrices(activeCamera.projectionMatrix, activeCamera.matrixWorldInverse)
    .multiply(originMatrix);
  frustum.setFromProjectionMatrix(viewProjection, activeCamera.coordinateSystem);
  selectTerrainTiles(terrainOptions, eye, frustum, wanted);
  resolveTerrainDraws(terrainOptions, wanted, checkTileLoaded, draws);
  tileStreamer.update(wanted, draws);
  for (let drawIndex = 0; drawIndex < shown.count; drawIndex++) {
    const mesh = tileStreamer.get(shown.keys[drawIndex] ?? 0);
    if (mesh) mesh.visible = false;
  }
  for (let drawIndex = 0; drawIndex < draws.count; drawIndex++) {
    const mesh = tileStreamer.get(draws.keys[drawIndex] ?? 0);
    if (mesh) mesh.visible = true;
  }
  shown.keys.set(draws.keys.subarray(0, draws.count));
  shown.count = draws.count;
});

onUnmounted(() => {
  for (const worker of workers) worker.terminate();
  tileStreamer.dispose();
  terrainMaterial.dispose();
});
</script>

<template>
  <primitive :object="tileGroup" />
</template>
