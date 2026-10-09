<script setup lang="ts">
import type { PlantedTerrainTile } from "#src/models/PlantedTerrainTile";
import type { TerrainWorkerGround } from "#src/models/world/TerrainWorkerGround";
import type { TerrainWorkerMessage } from "#src/models/world/TerrainWorkerMessage";
import type {
  LightUniforms,
  TerrainOptions,
  TerrainRing,
  TerrainSelection,
  WaterUniforms,
  WindUniforms,
} from "genshin-engine";
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
  createTerrainRing,
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
import { Box3, BufferAttribute, Frustum, Group, Matrix4, Mesh, Vector3 } from "three";
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
// The rings past the shadows' reach are one mesh a level, made as the level's first tile arrives: a far tile is written
// Into its level's ring as it arrives and freed from it as it leaves, so the frame never rebuilds a ring, and the
// Streamer holds the far tile by its key alone. Beside each ring, the tiles the view draws in it this frame
const ringMap = new Map<number, TerrainRing>();
const ringDrawnKeysMap = new Map<number, number[]>();
const checkIsNear = (key: number): boolean => checkTerrainTileCasts(terrainOptions, key, shadowReach);
const getRing = (level: number): TerrainRing => {
  const heldRing = ringMap.get(level);
  if (heldRing) return heldRing;
  const ring = createTerrainRing(terrainOptions, tileIndices, terrainMaterial);
  ring.mesh.receiveShadow = true;
  ring.mesh.layers.enable(TERRAIN_LAYER);
  ringMap.set(level, ring);
  ringDrawnKeysMap.set(level, []);
  tileGroup.add(ring.mesh);
  return ring;
};
const tileStreamer = createTileStreamer<Mesh | number>({
  disposeTile: (tile) => {
    if (tile instanceof Mesh) {
      tileGroup.remove(tile);
      tile.geometry.dispose();
      for (const child of tile.children) if (child instanceof Mesh) child.geometry.dispose();
      return;
    }
    ringMap.get(getTerrainTileLevel(tile))?.remove(tile);
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
    getRing(getTerrainTileLevel(key)).add(terrainTile);
    tileStreamer.receive(key, key);
    return;
  }
  const size = finestTileSize * 2 ** getTerrainTileLevel(key);
  const mesh = new Mesh(
    createTerrainTileGeometry(terrainTile, index, new Box3().setFromArray(terrainTile.positions)),
    terrainMaterial,
  );
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
  if (isReady || !wanted.keys.subarray(0, wanted.count).every((key) => tileStreamer.has(key))) return;
  isReady = true;
  emit("ready");
});

onUnmounted(() => {
  for (const worker of workers) worker.terminate();
  tileStreamer.dispose();
  for (const ring of ringMap.values()) ring.dispose();
  terrainMaterial.dispose();
  flowerMaterial.dispose();
});
</script>

<template>
  <primitive :object="tileGroup" />
</template>
