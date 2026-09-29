import type { RegionData } from "#src/models/world/RegionData";
import type { Vector3 } from "three";

import { regionDataSchema } from "#src/models/world/RegionData";
import { REGION_REACH, REGION_RECHECK_DISTANCE } from "#src/services/constants";
import { catalogue } from "#src/services/world/catalogue";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { useLoop, useTres } from "@tresjs/core";
import { computeOutlineDistance } from "genshin-engine";

// Each region's data is fetched when the camera comes within reach of any of its areas' outlines, and released when it
// Leaves. It is fetched rather than imported because the browser keeps an imported module for the life of the page,
// So an imported region could never be released. Reach is rechecked only once the camera has moved a stretch, and a
// Region whose data fails its schema is logged and left undrawn while the rest of the world loads
export const useRegionData = (origin: Vector3, regionDataBaseUrl: string) => {
  const { camera } = useTres();
  const { onBeforeRender } = useLoop();
  const regionDataMap = shallowReactive(new Map<string, RegionData>());
  const pendingRegionIds = new Set<string>();
  const wantedRegionIds = new Set<string>();
  let checkedX = Infinity;
  let checkedZ = Infinity;

  onBeforeRender(() => {
    const activeCamera = camera.value;
    if (!activeCamera) return;
    const x = activeCamera.position.x + origin.x;
    const z = activeCamera.position.z + origin.z;
    if (Math.hypot(x - checkedX, z - checkedZ) < REGION_RECHECK_DISTANCE) return;
    checkedX = x;
    checkedZ = z;
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
      getResultAsync(async () => {
        const url = `/${regionDataBaseUrl}/${id}.json`;
        const response = await fetch(url);
        if (!response.ok)
          throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.status} ${response.statusText}`);
        // A server falling back to a page for a missing file answers 200 with HTML, which fails here or at the schema
        const regionJson: unknown = await response.json();
        return regionDataSchema.parse(regionJson);
      }).match(
        (regionData) => {
          pendingRegionIds.delete(id);
          // A region that left reach while it was fetching is not kept
          if (wantedRegionIds.has(id)) regionDataMap.set(id, regionData);
        },
        (error) => {
          pendingRegionIds.delete(id);
          console.error(error);
        },
      );
    }
  });

  return regionDataMap;
};
