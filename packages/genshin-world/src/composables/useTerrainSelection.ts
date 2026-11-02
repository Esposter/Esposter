import type { TerrainOptions, TerrainSelection, TileStreamer } from "genshin-engine";
import type { Camera, Mesh } from "three";
import type { MaybeRefOrGetter } from "vue";

import { FINEST_TILE_LEVEL, TILE_SELECTION_CAPACITY } from "#src/services/constants";
import { measureLoadStep } from "#src/services/loading/measureLoadStep";
import { createFrustumSetter } from "#src/services/world/createFrustumSetter";
import { createTerrainSelection, getTerrainTileLevel, resolveTerrainDraws, selectTerrainTiles } from "genshin-engine";
import { Frustum, Vector3 } from "three";
import { toValue } from "vue";

// Each frame the quadtree is walked from the eye's world position, what is missing is asked for, and the tiles to
// Draw are shown in place of last frame's. It is walked twice: in the view, for what is asked for first and what makes
// The terrain ready, and all round the eye, for what is held and drawn. Drawn all round, the ground is the same
// Whichever way the camera looks, and each pass culls the tiles by its own camera: the view keeps what is in front of
// It, a shadow cascade the hills off screen that shade what is, and the grass's capture the ground under it. The
// Frustum is built in world coordinates, the scene's view moved by the origin, so the selection never sees the
// Floating origin. The camera's matrices are brought up to date first, since this runs before the frame's render does
// It and runs while a paused canvas renders nothing. The terrain is ready, once every ground in reach has arrived, the
// First frame every finest tile its view wants has arrived over them or been given up
export const useTerrainSelection = ({
  draws,
  endRefresh,
  isGroundSettled,
  onReady,
  terrainOptions,
  tileStreamer,
}: {
  draws: TerrainSelection;
  endRefresh: (checkIsSettled: () => boolean) => void;
  isGroundSettled: MaybeRefOrGetter<boolean>;
  onReady: () => void;
  terrainOptions: TerrainOptions;
  tileStreamer: TileStreamer<Mesh | number>;
}) => {
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
  measureLoadStep("terrain", isTerrainReady);
  const checkTileLoaded = (key: number): boolean => tileStreamer.has(key);
  const checkIsTileSettled = (key: number): boolean => tileStreamer.checkIsSettled(key);
  const checkIsSelectionSettled = (
    { count, keys }: TerrainSelection,
    checkIsSettled: (key: number) => boolean,
  ): boolean => keys.subarray(0, count).every((key) => checkIsSettled(key));
  // The first frame waits only on the finest tiles it wants, since the coarser rings keep streaming after ready
  const checkIsFirstFrameSettled = (key: number): boolean =>
    getTerrainTileLevel(key) !== FINEST_TILE_LEVEL || checkIsTileSettled(key);
  // Built once, since the settle runs every frame and the refresh ends only when both selections are settled
  const checkIsRefreshSettled = () =>
    checkIsSelectionSettled(wanted, checkIsTileSettled) && checkIsSelectionSettled(surrounding, checkIsTileSettled);
  return {
    select: (activeCamera: Camera, origin: Vector3) => {
      setFrustum(frustum, activeCamera, origin);
      eye.copy(activeCamera.position).add(origin);
      selectTerrainTiles(terrainOptions, eye, frustum, wanted);
      selectTerrainTiles(terrainOptions, eye, undefined, surrounding);
      resolveTerrainDraws(terrainOptions, surrounding, checkTileLoaded, draws);
      resolveTerrainDraws(terrainOptions, wanted, checkTileLoaded, viewDraws);
      tileStreamer.update(wanted, draws, surrounding);
    },
    settle: () => {
      endRefresh(checkIsRefreshSettled);
      if (isReady || !toValue(isGroundSettled) || !checkIsSelectionSettled(wanted, checkIsFirstFrameSettled)) return;
      isReady = true;
      resolveTerrainReady();
      onReady();
    },
    shown,
    viewDraws,
  };
};
