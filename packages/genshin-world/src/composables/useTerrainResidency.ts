import type { DevRegistry } from "#src/models/dev/DevRegistry";
import type { RegionGround } from "#src/models/world/RegionGround";
import type { TerrainWorkerMessage } from "#src/models/world/TerrainWorkerMessage";
import type { TerrainOptions, TerrainRing } from "genshin-engine";
import type { Group, Material } from "three";
import type { MaybeRefOrGetter } from "vue";

import { useDevRegistration } from "#src/composables/useDevRegistration";
import { TerrainWorkerMessageKind } from "#src/models/world/TerrainWorkerMessageKind";
import { MAX_PENDING_TILE_COUNT, TILE_SELECTION_CAPACITY } from "#src/services/constants";
import { createSettledCommand } from "#src/services/dev/commands/createSettledCommand";
import { LOAD_STEP_MEASURE_PREFIX } from "#src/services/loading/constants";
import {
  checkTerrainBoundsOverlap,
  createTerrainRing,
  createTileStreamer,
  getTerrainOverlayBounds,
  getTerrainTileBounds,
  getTerrainTileLevel,
  MAX_TILE_ATTEMPTS,
  TERRAIN_LAYER,
} from "genshin-engine";
import { Mesh } from "three";
import { toValue, watch } from "vue";

const disposeTileMesh = (mesh: Mesh) => {
  mesh.geometry.dispose();
  for (const child of mesh.children) if (child instanceof Mesh) child.geometry.dispose();
};

// The tiles the view holds, each as a streamed tile or, past the shadows' reach, a slot in its level's ring. The streamer asks
// The pool for each tile the view wants and frees the one the view has moved on from
export const useTerrainResidency = ({
  checkIsViewSettled,
  devRegistry,
  postTile,
  postToEach,
  regionGrounds,
  terrainMaterial,
  terrainOptions,
  tileGroup,
  tileIndices,
}: {
  // Whether the view the selection holds is settled with nothing in flight behind it, which the settled read answers
  checkIsViewSettled: () => boolean;
  devRegistry?: DevRegistry;
  postTile: (key: number, message: TerrainWorkerMessage) => void;
  postToEach: (message: TerrainWorkerMessage) => void;
  regionGrounds: MaybeRefOrGetter<RegionGround[]>;
  terrainMaterial: Material;
  terrainOptions: TerrainOptions;
  tileGroup: Group;
  tileIndices: Uint16Array | Uint32Array;
}) => {
  const { cellsPerSide, finestTileSize } = terrainOptions;
  // The rings past the shadows' reach are one mesh a level, made as the level's first tile arrives: a far tile is written
  // Into its level's ring as it arrives and freed from it as it leaves, so the frame never rebuilds a ring, and the
  // Streamer holds the far tile by its key alone. Beside each ring, the tiles the view draws in it this frame
  const ringMap = new Map<number, TerrainRing>();
  const ringDrawnKeysMap = new Map<number, number[]>();
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
  // The tiles asked for again while the streamer still held them, each built over a ground that arrived under it since,
  // Counted from the start of the latest refresh
  let rebuiltTileCount = 0;
  // When the latest refresh began, until every tile round the eye is settled over its ground, measured then as the load
  // Step `terrain-refresh` with the tiles it rebuilt. A ground arriving while one is under way extends it
  let refreshStart: number | undefined;
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
      postTile(key, message);
    },
  });
  // A region's ground arrives after the tiles over it may have been built, so each worker is sent the grounds so far ahead
  // Of any tile asked of it after, and every tile held or generating whose heights an arriving ground reaches is asked for
  // Again over them, each held one drawn until its replacement arrives. A tile past every arriving ground's reach would be
  // Built again over the very heights it holds, so it is kept
  watch(
    () => toValue(regionGrounds),
    (grounds, previousGrounds) => {
      postToEach({ kind: TerrainWorkerMessageKind.RegionGrounds, regionGrounds: grounds });
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
  // Ends the refresh once `checkIsSettled` says every tile round the eye is settled, so it is only asked while one is under way
  const endRefresh = (checkIsSettled: () => boolean) => {
    if (refreshStart === undefined || !checkIsSettled()) return;
    performance.measure(`${LOAD_STEP_MEASURE_PREFIX}terrain-refresh`, {
      detail: { tileCount: rebuiltTileCount },
      start: refreshStart,
    });
    refreshStart = undefined;
  };
  // The settled read a script waits on, registered while the terrain is mounted, answering for the view the selection
  // Settles and for the tiles in flight behind it
  useDevRegistration({
    createHandle: () => ({ commands: [createSettledCommand({ checkIsSettled: checkIsViewSettled })], variables: [] }),
    devRegistry,
  });
  return { disposeTileMesh, endRefresh, failTile, getRing, ringDrawnKeysMap, ringMap, tileStreamer };
};
