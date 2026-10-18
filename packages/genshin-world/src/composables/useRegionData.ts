import type { Catalogue } from "#src/models/world/Catalogue";
import type { LoadedRegion } from "#src/models/world/LoadedRegion";
import type { RegionGround } from "#src/models/world/RegionGround";
import type { Vector3 } from "three";

import { regionGroundSchema } from "#src/models/world/RegionGround";
import { checkIsGameDataKey } from "#src/services/data/checkIsGameDataKey";
import { gameDataLock } from "#src/services/data/gameDataLock";
import { readGameData } from "#src/services/data/readGameData";
import { REGION_REACH } from "#src/services/constants";
import { measureLoadStep } from "#src/services/loading/measureLoadStep";
import { createRecheckDueCheck } from "#src/services/world/createRecheckDueCheck";
import { readLoadedRegion } from "#src/services/world/readLoadedRegion";
import { selectGroundKeysInReach } from "#src/services/world/selectGroundKeysInReach";
import { selectLaidGroundKeys } from "#src/services/world/selectLaidGroundKeys";
import { getResultAsync } from "@esposter/shared";
import { useLoop, useTres } from "@tresjs/core";
import { computeOutlineDistance } from "genshin-engine";

// Each region's data and the palettes its buildings are drawn in are fetched when the camera comes within reach of any
// Of its areas' outlines, and released when it leaves. Each region's ground, its own record or its areas' pieces, is
// Fetched as the region or that area comes within reach and kept once it arrives, since it is drawn past the reach a
// Region is released at. It is fetched rather than imported. Because the browser keeps an imported module for the life of
// The page, so an imported region could never be released.
// Reach is rechecked only once the camera has moved a stretch, and a region whose data fails its schema or does not
// Arrive in time is logged and left undrawn while the rest of the world loads. The data is settled whenever every region
// In reach has arrived or failed, which the first view's settling marks as the world ready to be shown
export const useRegionData = (
  origin: Vector3,
  regionDataBaseUrl: string,
  gameDataBaseUrl: string,
  catalogue: Catalogue,
) => {
  const { camera } = useTres();
  const { onBeforeRender } = useLoop();
  const regionDataMap = shallowReactive(new Map<string, LoadedRegion>());
  // Each ground laid over Windrise's, by its lock key, set once as it arrives and kept after
  const regionGroundMap = shallowReactive(new Map<string, RegionGround>());
  const groundKeys = selectLaidGroundKeys(Object.keys(gameDataLock.objects).filter((key) => checkIsGameDataKey(key)));
  const pendingGroundKeys = new Set<string>();
  const requestedGroundKeys = new Set<string>();
  const pendingRegionIds = new Set<string>();
  const wantedRegionIds = new Set<string>();
  const isRegionDataSettled = ref(false);
  const settle = () => {
    isRegionDataSettled.value = pendingRegionIds.size === 0 && pendingGroundKeys.size === 0;
  };
  const checkIsRecheckDue = createRecheckDueCheck();

  onBeforeRender(() => {
    const activeCamera = camera.value;
    if (!activeCamera) return;
    const x = activeCamera.position.x + origin.x;
    const z = activeCamera.position.z + origin.z;
    if (!checkIsRecheckDue(x, z)) return;
    for (const key of selectGroundKeysInReach(catalogue.regions, groundKeys, x, z)) {
      if (requestedGroundKeys.has(key)) continue;
      requestedGroundKeys.add(key);
      pendingGroundKeys.add(key);
      // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and a frame has nothing to await it
      getResultAsync(() => measureLoadStep("regions", readGameData(gameDataBaseUrl, key, regionGroundSchema))).match(
        (ground) => {
          pendingGroundKeys.delete(key);
          regionGroundMap.set(key, ground);
          settle();
        },
        (error) => {
          pendingGroundKeys.delete(key);
          requestedGroundKeys.delete(key);
          console.error(error);
          settle();
        },
      );
    }
    for (const { areas, id } of catalogue.regions) {
      const isInReach = areas.some(({ outline }) => computeOutlineDistance(outline, x, z) <= REGION_REACH);
      if (!isInReach) {
        wantedRegionIds.delete(id);
        regionDataMap.delete(id);
        continue;
      }

      wantedRegionIds.add(id);
      if (regionDataMap.has(id) || pendingRegionIds.has(id)) continue;
      pendingRegionIds.add(id);
      // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and a frame has nothing to await it
      getResultAsync(() => measureLoadStep("regions", readLoadedRegion(regionDataBaseUrl, gameDataBaseUrl, id))).match(
        (regionData) => {
          pendingRegionIds.delete(id);
          // A region that left reach while it was fetching is not kept
          if (wantedRegionIds.has(id)) regionDataMap.set(id, regionData);
          settle();
        },
        (error) => {
          pendingRegionIds.delete(id);
          console.error(error);
          settle();
        },
      );
    }
    // A check that has nothing to fetch settles at once
    settle();
  });

  return { isRegionDataSettled, regionDataMap, regionGroundMap };
};
