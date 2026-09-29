import type { RegionData } from "@/models/genshin/world/RegionData";
import type { Vector3 } from "three";

import { regionDataSchema } from "@/models/genshin/world/RegionData";
import { REGION_REACH, REGION_RECHECK_DISTANCE } from "@/services/genshin/constants";
import { catalogue } from "@/services/genshin/world/catalogue";
import { getResultAsync } from "@esposter/shared";
import { computeOutlineDistance } from "genshin-engine";

// Each region's data is fetched when the camera comes within reach of any of its areas' outlines, and released when it
// Leaves. It is fetched rather than imported because the browser keeps an imported module for the life of the page,
// So an imported region could never be released. Reach is rechecked only once the camera has moved a stretch, and a
// Region whose data fails its schema is logged and left undrawn while the rest of the world loads
export const useRegionData = (origin: Vector3) => {
  const { camera } = useTres();
  const { onBeforeRender } = useLoop();
  const regionDataMap = shallowReactive(new Map<string, RegionData>());
  const pendingRegionIds = new Set<string>();
  const wantedRegionIds = new Set<string>();
  let checkedX = Infinity;
  let checkedZ = Infinity;

  const loadRegion = (regionId: string) => {
    pendingRegionIds.add(regionId);
    return getResultAsync(async () => regionDataSchema.parse(await $fetch(`/genshin/${regionId}.json`))).match(
      (regionData) => {
        pendingRegionIds.delete(regionId);
        // A region that left reach while it was fetching is not kept
        if (wantedRegionIds.has(regionId)) regionDataMap.set(regionId, regionData);
      },
      (error) => {
        pendingRegionIds.delete(regionId);
        console.error(error);
      },
    );
  };

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
      if (!regionDataMap.has(id) && !pendingRegionIds.has(id)) loadRegion(id);
    }
  });

  return regionDataMap;
};
