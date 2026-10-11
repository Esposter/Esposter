import type { Catalogue } from "#src/models/world/Catalogue";
import type { LoadedRegion } from "#src/models/world/LoadedRegion";
import type { Vector3 } from "three";

import { REGION_REACH } from "#src/services/constants";
import { measureLoadStep } from "#src/services/loading/measureLoadStep";
import { createRecheckDueCheck } from "#src/services/world/createRecheckDueCheck";
import { readLoadedRegion } from "#src/services/world/readLoadedRegion";
import { getResultAsync } from "@esposter/shared";
import { useLoop, useTres } from "@tresjs/core";
import { computeOutlineDistance } from "genshin-engine";

// Each region's data, with the palettes its buildings are drawn in, is fetched when the camera comes within reach of
// Any of its areas' outlines, and released when it leaves. It is fetched rather than imported because the browser keeps
// An imported module for the life of the page, so an imported region could never be released. Reach is rechecked only once the camera has moved a stretch, and a
// Region whose data fails its schema or does not arrive in time is logged and left undrawn while the rest of the world
// Loads. The data is settled whenever every region in reach has arrived or failed, which the first view's settling
// Marks as the world ready to be shown
export const useRegionData = (
  origin: Vector3,
  regionDataBaseUrl: string,
  gameDataBaseUrl: string,
  catalogue: Catalogue,
) => {
  const { camera } = useTres();
  const { onBeforeRender } = useLoop();
  const regionDataMap = shallowReactive(new Map<string, LoadedRegion>());
  const pendingRegionIds = new Set<string>();
  const wantedRegionIds = new Set<string>();
  const isRegionDataSettled = ref(false);
  const settle = () => {
    isRegionDataSettled.value = pendingRegionIds.size === 0;
  };
  const checkIsRecheckDue = createRecheckDueCheck();

  onBeforeRender(() => {
    const activeCamera = camera.value;
    if (!activeCamera) return;
    const x = activeCamera.position.x + origin.x;
    const z = activeCamera.position.z + origin.z;
    if (!checkIsRecheckDue(x, z)) return;
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

  return { isRegionDataSettled, regionDataMap };
};
