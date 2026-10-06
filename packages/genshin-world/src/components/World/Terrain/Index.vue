<script setup lang="ts">
import type { TerrainTileRequest } from "#src/models/TerrainTileRequest";
import type { LightUniforms, TerrainOptions, TerrainSelection, TerrainTile, WaterUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { MAX_PENDING_TILE_COUNT, TERRAIN_WORKER_COUNT, TILE_SELECTION_CAPACITY } from "#src/services/constants";
import { useLoop, useTres } from "@tresjs/core";
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
import { uniform } from "three/tsl";

interface Props {
  // Starts one of the pool's workers, which the app builds with its bundler from the package's worker entry
  createTerrainWorker: () => Worker;
  // Written each frame with the tiles drawn, for whatever else reads the ground, such as the grass's capture
  draws: TerrainSelection;
  lightUniforms: LightUniforms;
  // The world coordinate the scene's origin stands on, which the floating origin moves
  origin: Vector3;
  rampTexture: DataTexture;
  terrainOptions: TerrainOptions;
  // The region's water, whose caustics shimmer on the ground under it
  waterUniforms?: WaterUniforms;
}

const { createTerrainWorker, draws, lightUniforms, origin, rampTexture, terrainOptions, waterUniforms } =
  defineProps<Props>();
const emit = defineEmits<{ ready: [] }>();
const { camera } = useTres();
const { onBeforeRender } = useLoop();
const { cellsPerSide, finestTileSize } = terrainOptions;
const morphEye = uniform(new Vector3());
const terrainMaterial = createTerrainMaterial(terrainOptions, morphEye, { lightUniforms, rampTexture }, waterUniforms);
const index = new BufferAttribute(computeTerrainIndices(cellsPerSide), 1);
// Every held tile is a mesh in this group, shown only while it is drawn, so a tile coming back into range costs a flag
const tileGroup = new Group();
const workers = Array.from({ length: TERRAIN_WORKER_COUNT }, () => createTerrainWorker());
let requestCount = 0;
const tileStreamer = createTileStreamer<Mesh>({
  disposeTile: (mesh) => {
    tileGroup.remove(mesh);
    mesh.geometry.dispose();
  },
  maxCachedCount: TILE_SELECTION_CAPACITY,
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
};
for (const worker of workers)
  worker.addEventListener("message", (event) => {
    receiveTile(event);
  });
// Built once, since the draws are resolved every frame
const checkTileLoaded = (key: number): boolean => tileStreamer.has(key);
const wanted = createTerrainSelection(TILE_SELECTION_CAPACITY);
const surrounding = createTerrainSelection(TILE_SELECTION_CAPACITY);
const shown = createTerrainSelection(TILE_SELECTION_CAPACITY);
const eye = new Vector3();
const originMatrix = new Matrix4();
const viewProjection = new Matrix4();
const frustum = new Frustum();
let isReady = false;
// Each frame the quadtree is walked from the eye's world position, what is missing is asked for, and the tiles to
// Draw are shown in place of last frame's. It is walked twice: in the view, for what is asked for first and what makes
// The terrain ready, and all round the eye, for what is held and drawn. Drawn all round, the ground is the same
// Whichever way the camera looks, and each pass culls the tiles by its own camera: the view keeps what is in front of
// It, a shadow cascade the hills off screen that shade what is, and the grass's capture the ground under it. The
// Frustum is built in world coordinates, the scene's view moved by the origin, so the selection never sees the
// Floating origin. The camera's matrices are brought up to date first, since this runs before the frame's render does
// It and runs while a paused canvas renders nothing. The eye the ground morphs by is written here too, so every pass of
// The frame draws the ground the view selected. The terrain is ready the first frame every tile its view wants has
// Arrived
onBeforeRender(() => {
  const activeCamera = camera.value;
  if (!activeCamera) return;
  activeCamera.updateMatrixWorld();
  morphEye.value.setFromMatrixPosition(activeCamera.matrixWorld);
  eye.copy(activeCamera.position).add(origin);
  originMatrix.makeTranslation(-origin.x, -origin.y, -origin.z);
  viewProjection
    .multiplyMatrices(activeCamera.projectionMatrix, activeCamera.matrixWorldInverse)
    .multiply(originMatrix);
  frustum.setFromProjectionMatrix(viewProjection, activeCamera.coordinateSystem);
  selectTerrainTiles(terrainOptions, eye, frustum, wanted);
  selectTerrainTiles(terrainOptions, eye, undefined, surrounding);
  resolveTerrainDraws(terrainOptions, surrounding, checkTileLoaded, draws);
  tileStreamer.update(wanted, draws, surrounding);
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
  if (isReady || !wanted.keys.subarray(0, wanted.count).every((key) => tileStreamer.has(key))) return;
  isReady = true;
  emit("ready");
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
