<script setup lang="ts">
import type { PlantedTerrainTile } from "#src/models/PlantedTerrainTile";
import type { TerrainWorkerGround } from "#src/models/world/TerrainWorkerGround";
import type { TerrainWorkerMessage } from "#src/models/world/TerrainWorkerMessage";
import type { LightUniforms, TerrainOptions, TerrainSelection, WaterUniforms, WindUniforms } from "genshin-engine";
import type { DataTexture } from "three";

import { TerrainWorkerMessageKind } from "#src/models/world/TerrainWorkerMessageKind";
import { MAX_PENDING_TILE_COUNT, TERRAIN_WORKER_COUNT, TILE_SELECTION_CAPACITY } from "#src/services/constants";
import { useLoop, useTres } from "@tresjs/core";
import {
  checkTerrainTileCasts,
  computeTerrainIndices,
  createFlowerMaterial,
  createFlowerTileGeometry,
  createTerrainMaterial,
  createTerrainSelection,
  createTerrainTileGeometry,
  createTileStreamer,
  getTerrainTileColumn,
  getTerrainTileLevel,
  getTerrainTileRow,
  mergeTerrainTiles,
  resolveTerrainDraws,
  selectTerrainTiles,
  TERRAIN_LAYER,
  writeTerrainRingIndices,
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
  draws,
  lightUniforms,
  origin,
  rampTexture,
  shadowReach,
  terrainOptions,
  terrainWorkerGround,
  waterUniforms,
  windUniforms,
} = defineProps<Props>();
const emit = defineEmits<{ ready: [] }>();
const { camera, renderer, scene } = useTres();
const { onBeforeRender } = useLoop();
const { cellsPerSide, finestRange, finestTileSize } = terrainOptions;
const morphEye = uniform(new Vector3());
const terrainMaterial = createTerrainMaterial(terrainOptions, morphEye, { lightUniforms, rampTexture }, waterUniforms);
const tileIndices = computeTerrainIndices(cellsPerSide);
const index = new BufferAttribute(tileIndices, 1);
const tileVertexCount = (cellsPerSide + 1) ** 2;
// Every finest tile's flowers are one instanced draw of the one flower in the one flower material, a child of its tile's
// Mesh, so they show, hide and go with the tile
const flowerMaterial = createFlowerMaterial({ lightUniforms, rampTexture }, windUniforms);
// Every held tile is a mesh in this group, shown only while it is drawn, so a tile coming back into range costs a flag
const tileGroup = new Group();
// Each worker is loaded with its ground as it starts. A worker takes its messages in the order they were posted, so its
// Ground is loaded before any tile asked of it, with nothing to wait for
const workers = Array.from({ length: TERRAIN_WORKER_COUNT }, () => {
  const worker = createTerrainWorker();
  const message: TerrainWorkerMessage = { ground: terrainWorkerGround, kind: TerrainWorkerMessageKind.Load };
  // oxlint-disable-next-line unicorn/require-post-message-target-origin -- a Worker's postMessage takes no origin
  worker.postMessage(message);
  return worker;
});
let requestCount = 0;
// The rings past the shadows' reach hold their tiles' arrays, not meshes: each such level is one mesh over every tile of
// The level held, its index naming the tiles drawn in it, rebuilt when a tile of the level arrives or leaves
const farTileMap = new Map<number, PlantedTerrainTile>();
const dirtyRingLevels = new Set<number>();
const ringMeshMap = new Map<number, Mesh>();
const ringIndexMap = new Map<number, Uint32Array>();
// Each held far tile's place in its level's ring, and the tiles each ring draws this frame and last wrote its index for
const ringOrdinalMap = new Map<number, number>();
const ringDrawnMap = new Map<number, number[]>();
const ringWrittenMap = new Map<number, number[]>();
const checkIsNear = (key: number): boolean => checkTerrainTileCasts(terrainOptions, key, shadowReach);
const tileStreamer = createTileStreamer<Mesh | PlantedTerrainTile>({
  disposeTile: (tile) => {
    if (tile instanceof Mesh) {
      tileGroup.remove(tile);
      tile.geometry.dispose();
      for (const child of tile.children) if (child instanceof Mesh) child.geometry.dispose();
      return;
    }
    farTileMap.delete(tile.key);
    dirtyRingLevels.add(getTerrainTileLevel(tile.key));
  },
  maxCachedCount: TILE_SELECTION_CAPACITY,
  maxPendingCount: MAX_PENDING_TILE_COUNT,
  requestTile: (key) => {
    const message: TerrainWorkerMessage = {
      kind: TerrainWorkerMessageKind.Tile,
      request: { cellsPerSide, finestTileSize, key },
    };
    workers[requestCount % workers.length]?.postMessage(message);
    requestCount++;
  },
});
const receiveTile = async (event: MessageEvent<PlantedTerrainTile>) => {
  const terrainTile = event.data;
  const { key, plantColors, plantMatrices } = terrainTile;
  if (!checkIsNear(key)) {
    farTileMap.set(key, terrainTile);
    dirtyRingLevels.add(getTerrainTileLevel(key));
    tileStreamer.receive(key, terrainTile);
    return;
  }
  const size = finestTileSize * 2 ** getTerrainTileLevel(key);
  const mesh = new Mesh(createTerrainTileGeometry(terrainTile, index), terrainMaterial);
  mesh.position.set(getTerrainTileColumn(key) * size, 0, getTerrainTileRow(key) * size);
  mesh.matrixAutoUpdate = false;
  mesh.updateMatrix();
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.layers.enable(TERRAIN_LAYER);
  if (plantMatrices.length > 0) {
    const flowerMesh = new Mesh(createFlowerTileGeometry(plantMatrices, plantColors), flowerMaterial);
    flowerMesh.receiveShadow = true;
    mesh.add(flowerMesh);
  }
  // Three compiles only what is visible and unparented, so the tile's pipelines build before any frame can draw it,
  // Then it is held hidden and handed to the streamer, which shows it from the next frame that draws it
  const activeCamera = camera.value;
  const activeScene = scene.value;
  if (activeCamera && activeScene) await renderer.compileAsync(mesh, activeCamera, activeScene);
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
// The tiles the view draws, which the far rings draw by: the wanted ones resolved, so only what the camera sees is indexed
const viewDraws = createTerrainSelection(TILE_SELECTION_CAPACITY);
const eye = new Vector3();
const originMatrix = new Matrix4();
const viewProjection = new Matrix4();
const frustum = new Frustum();
let isReady = false;
// Rebuilds a far level's ring: every tile of the level held, laid out in the order their keys sort, each tile's
// Ordinal being its place in that order, which is what its indices are numbered by
const rebuildRing = (level: number): void => {
  const oldMesh = ringMeshMap.get(level);
  if (oldMesh) {
    tileGroup.remove(oldMesh);
    oldMesh.geometry.dispose();
  }
  ringMeshMap.delete(level);
  ringIndexMap.delete(level);
  ringDrawnMap.delete(level);
  ringWrittenMap.delete(level);
  const keys = [...farTileMap.keys()]
    .filter((key) => getTerrainTileLevel(key) === level)
    .toSorted((firstKey, secondKey) => firstKey - secondKey);
  for (const [ordinal, key] of keys.entries()) ringOrdinalMap.set(key, ordinal);
  if (keys.length === 0) return;
  const tiles = keys.map((key) => farTileMap.get(key)).filter((tile) => tile !== undefined);
  const indices = new Uint32Array(keys.length * tileIndices.length);
  const mesh = new Mesh(
    createTerrainTileGeometry(mergeTerrainTiles(tiles, finestTileSize), new BufferAttribute(indices, 1)),
    terrainMaterial,
  );
  mesh.receiveShadow = true;
  mesh.layers.enable(TERRAIN_LAYER);
  mesh.visible = false;
  ringMeshMap.set(level, mesh);
  ringIndexMap.set(level, indices);
  ringDrawnMap.set(level, []);
  ringWrittenMap.set(level, []);
  tileGroup.add(mesh);
};
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
  resolveTerrainDraws(terrainOptions, wanted, checkTileLoaded, viewDraws);
  tileStreamer.update(wanted, draws, surrounding);
  for (let drawIndex = 0; drawIndex < shown.count; drawIndex++) {
    const tile = tileStreamer.get(shown.keys[drawIndex] ?? 0);
    if (tile instanceof Mesh) tile.visible = false;
  }
  for (const level of dirtyRingLevels) rebuildRing(level);
  dirtyRingLevels.clear();
  for (const drawnOrdinals of ringDrawnMap.values()) drawnOrdinals.length = 0;
  for (let drawIndex = 0; drawIndex < draws.count; drawIndex++) {
    const tile = tileStreamer.get(draws.keys[drawIndex] ?? 0);
    if (tile instanceof Mesh) tile.visible = true;
  }
  for (let drawIndex = 0; drawIndex < viewDraws.count; drawIndex++) {
    const key = viewDraws.keys[drawIndex] ?? 0;
    if (!checkIsNear(key)) ringDrawnMap.get(getTerrainTileLevel(key))?.push(ringOrdinalMap.get(key) ?? 0);
  }
  // A ring's index is written only when the tiles it draws have changed, which a view that holds still never does
  for (const [level, drawnOrdinals] of ringDrawnMap) {
    const mesh = ringMeshMap.get(level);
    const indices = ringIndexMap.get(level);
    const writtenOrdinals = ringWrittenMap.get(level);
    if (!mesh || !indices || !writtenOrdinals) continue;
    mesh.visible = drawnOrdinals.length > 0;
    if (!mesh.visible || drawnOrdinals.join(",") === writtenOrdinals.join(",")) continue;
    const count = writeTerrainRingIndices(indices, tileIndices, drawnOrdinals, tileVertexCount);
    mesh.geometry.setDrawRange(0, count);
    if (mesh.geometry.index) mesh.geometry.index.needsUpdate = true;
    writtenOrdinals.length = 0;
    writtenOrdinals.push(...drawnOrdinals);
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
  for (const mesh of ringMeshMap.values()) mesh.geometry.dispose();
  terrainMaterial.dispose();
  flowerMaterial.dispose();
});
</script>

<template>
  <primitive :object="tileGroup" />
</template>
