<script setup lang="ts">
import type { PlantedTerrainTile } from "#src/models/PlantedTerrainTile";
import type { RegionGround } from "#src/models/world/RegionGround";
import type { TerrainWorkerFailure } from "#src/models/world/TerrainWorkerFailure";
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
import {
  FINEST_TILE_LEVEL,
  MAX_PENDING_TILE_COUNT,
  TERRAIN_WORKER_COUNT,
  TILE_SELECTION_CAPACITY,
} from "#src/services/constants";
import { LOAD_STEP_MEASURE_PREFIX } from "#src/services/loading/constants";
import { measureLoadStep } from "#src/services/loading/measureLoadStep";
import { createFrustumSetter } from "#src/services/world/createFrustumSetter";
import { createTileHolders } from "#src/services/world/createTileHolders";
import { getResultAsync, noop } from "@esposter/shared";
import { useLoop, useTres } from "@tresjs/core";
import {
  checkTerrainBoundsOverlap,
  checkTerrainTileCasts,
  computeTerrainIndices,
  createFlowerMaterial,
  createFlowerTileGeometry,
  createTerrainMaterial,
  createTerrainRing,
  createTerrainSelection,
  createTerrainTileGeometry,
  createTileStreamer,
  getTerrainOverlayBounds,
  getTerrainTileBounds,
  getTerrainTileColumn,
  getTerrainTileLevel,
  getTerrainTileRow,
  MAX_TILE_ATTEMPTS,
  resolveTerrainDraws,
  selectTerrainTiles,
  TERRAIN_LAYER,
} from "genshin-engine";
import { Box3, BufferAttribute, Frustum, Group, Mesh, Vector3 } from "three";
import { uniform } from "three/tsl";

interface Props {
  // Starts one of the pool's workers, which the app builds with its bundler from the package's worker entry
  createTerrainWorker: () => Worker;
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
const tileHolders = createTileHolders(workers.length);
// The tiles asked for again while the streamer still held them, each built over a ground that arrived under it since,
// Counted from the start of the latest refresh
let rebuiltTileCount = 0;
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
const disposeTileMesh = (mesh: Mesh) => {
  mesh.geometry.dispose();
  for (const child of mesh.children) if (child instanceof Mesh) child.geometry.dispose();
};
const tileStreamer = createTileStreamer<Mesh | number>({
  disposeTile: (tile) => {
    if (tile instanceof Mesh) {
      tileGroup.remove(tile);
      disposeTileMesh(tile);
      return;
    }
    ringMap.get(getTerrainTileLevel(tile))?.remove(tile);
  },
  maxCachedCount: TILE_SELECTION_CAPACITY,
  maxPendingCount: MAX_PENDING_TILE_COUNT,
  requestTile: (key) => {
    if (tileStreamer.has(key)) rebuiltTileCount++;
    const message: TerrainWorkerMessage = {
      kind: TerrainWorkerMessageKind.Tile,
      request: { cellsPerSide, finestTileSize, key },
    };
    workers[tileHolders.assign(key)]?.postMessage(message);
  },
});
// When the latest refresh began, until every tile round the eye is settled over its ground, measured then as the load
// Step `terrain-refresh` with the tiles it rebuilt. A ground arriving while one is under way extends it
let refreshStart: number | undefined;
// A region's ground arrives after the tiles over it may have been built, so each worker is sent the grounds so far ahead
// Of any tile asked of it after, and every tile held or generating whose heights an arriving ground reaches is asked for
// Again over them, each held one drawn until its replacement arrives. A tile past every arriving ground's reach would be
// Built again over the very heights it holds, so it is kept
watch(
  () => regionGrounds,
  (grounds, previousGrounds) => {
    const message: TerrainWorkerMessage = { kind: TerrainWorkerMessageKind.RegionGrounds, regionGrounds: grounds };
    // oxlint-disable-next-line unicorn/require-post-message-target-origin -- a Worker's postMessage takes no origin
    for (const worker of workers) worker.postMessage(message);
    const arrivingReaches = grounds
      .filter((ground) => !previousGrounds.includes(ground))
      .map((ground) => getTerrainOverlayBounds(ground));
    tileStreamer.refresh((key) => {
      const tileBounds = getTerrainTileBounds(key, finestTileSize, cellsPerSide);
      return arrivingReaches.some((reach) => checkTerrainBoundsOverlap(reach, tileBounds));
    });
    if (refreshStart !== undefined) return;
    refreshStart = performance.now();
    rebuiltTileCount = 0;
  },
);
// A tile that cannot be built is released, so it is asked for again or given up, and the world is not held on it
const failTile = (key: number) => {
  if (tileStreamer.fail(key))
    console.error(`Terrain tile ${key} failed ${MAX_TILE_ATTEMPTS} times, so it is given up and drawn without`);
};
const receiveTile = async (terrainTile: PlantedTerrainTile) => {
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
  if (activeCamera && activeScene) {
    const isCompiled = await getResultAsync(async () => {
      await renderer.compileAsync(mesh, activeCamera, activeScene);
    }).match(
      () => true,
      (error) => {
        console.error(`Terrain tile ${key} failed to compile`, error);
        disposeTileMesh(mesh);
        failTile(key);
        return false;
      },
    );
    if (!isCompiled) return;
  }
  mesh.visible = false;
  tileGroup.add(mesh);
  tileStreamer.receive(key, mesh);
};
const receiveWorkerMessage = (workerIndex: number, event: MessageEvent<PlantedTerrainTile | TerrainWorkerFailure>) => {
  const { data } = event;
  if (!tileHolders.checkIsHeldBy(data.key, workerIndex)) return;
  tileHolders.release(data.key);
  if ("kind" in data) {
    failTile(data.key);
    return;
  }
  receiveTile(data);
};
// A worker that errors, or cannot read a message, has lost the tiles it holds, so each of those is failed
// The other workers keep generating
const failHeldTiles = (workerIndex: number, event: Event) => {
  console.error("A terrain worker failed", event);
  for (const key of tileHolders.takeHeldKeys(workerIndex)) failTile(key);
};
for (const [workerIndex, worker] of workers.entries()) {
  worker.addEventListener("message", (event) => receiveWorkerMessage(workerIndex, event));
  worker.addEventListener("error", (event) => failHeldTiles(workerIndex, event));
  worker.addEventListener("messageerror", (event) => failHeldTiles(workerIndex, event));
}
// Built once, since the draws are resolved every frame
const checkTileLoaded = (key: number): boolean => tileStreamer.has(key);
const checkIsTileSettled = (key: number): boolean => tileStreamer.isSettled(key);
const checkIsSelectionSettled = (
  { count, keys }: TerrainSelection,
  checkIsSettled: (key: number) => boolean,
): boolean => keys.subarray(0, count).every((key) => checkIsSettled(key));
// The first frame waits only on the finest tiles it wants, since the coarser rings keep streaming after ready
const checkIsFirstFrameSettled = (key: number): boolean =>
  getTerrainTileLevel(key) !== FINEST_TILE_LEVEL || tileStreamer.isSettled(key);
const wanted = createTerrainSelection(TILE_SELECTION_CAPACITY);
const surrounding = createTerrainSelection(TILE_SELECTION_CAPACITY);
const shown = createTerrainSelection(TILE_SELECTION_CAPACITY);
// The tiles the view draws, which the far rings draw by: the wanted ones resolved, so only what the camera sees is indexed
const viewDraws = createTerrainSelection(TILE_SELECTION_CAPACITY);
const eye = new Vector3();
const frustum = new Frustum();
const setFrustum = createFrustumSetter();
let isReady = false;
// The terrain's first settled tiles, measured from its mount to the frame it is ready
const { promise: isTerrainReady, resolve: resolveTerrainReady } = Promise.withResolvers<void>();
// oxlint-disable-next-line typescript/no-floating-promises -- the measure resolves with the terrain's ready, and nothing waits on it
measureLoadStep("terrain", isTerrainReady);
// Each frame the quadtree is walked from the eye's world position, what is missing is asked for, and the tiles to
// Draw are shown in place of last frame's. It is walked twice: in the view, for what is asked for first and what makes
// The terrain ready, and all round the eye, for what is held and drawn. Drawn all round, the ground is the same
// Whichever way the camera looks, and each pass culls the tiles by its own camera: the view keeps what is in front of
// It, a shadow cascade the hills off screen that shade what is, and the grass's capture the ground under it. The
// Frustum is built in world coordinates, the scene's view moved by the origin, so the selection never sees the
// Floating origin. The camera's matrices are brought up to date first, since this runs before the frame's render does
// It and runs while a paused canvas renders nothing. The eye the ground morphs by is written here too, so every pass of
// The frame draws the ground the view selected. The terrain is ready, once every ground in reach has arrived, the first
// Frame every finest tile its view wants has arrived over them or been given up
onBeforeRender(() => {
  const activeCamera = camera.value;
  if (!activeCamera) return;
  setFrustum(frustum, activeCamera, origin);
  morphEye.value.setFromMatrixPosition(activeCamera.matrixWorld);
  eye.copy(activeCamera.position).add(origin);
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
  if (
    refreshStart !== undefined &&
    checkIsSelectionSettled(wanted, checkIsTileSettled) &&
    checkIsSelectionSettled(surrounding, checkIsTileSettled)
  ) {
    performance.measure(`${LOAD_STEP_MEASURE_PREFIX}terrain-refresh`, {
      detail: { tileCount: rebuiltTileCount },
      start: refreshStart,
    });
    refreshStart = undefined;
  }
  if (isReady || !isGroundSettled || !checkIsSelectionSettled(wanted, checkIsFirstFrameSettled)) return;
  isReady = true;
  resolveTerrainReady();
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
