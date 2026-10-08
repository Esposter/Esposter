import type { Landmark } from "#src/models/world/Landmark";

import { JUMP_LANDMARK_KINDS } from "#src/services/map/constants";
import { catalogue } from "#src/services/world/catalogue";
import { readRegionData } from "#src/services/world/readRegionData";
import { getResultAsync } from "@esposter/shared";

// Every landmark a jump lands at across the whole catalogue rather than the regions in reach, since the map shows the
// Whole continent: each region's data is read once, and a region that fails is logged and left off
export const useJumpLandmarks = (regionDataBaseUrl: string) => {
  const jumpLandmarks = shallowRef<Landmark[]>([]);
  for (const { id } of catalogue.regions)
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
    getResultAsync(() => readRegionData(regionDataBaseUrl, id)).match(
      ({ landmarks }) => {
        jumpLandmarks.value = [
          ...jumpLandmarks.value,
          ...landmarks.filter(({ kind }) => JUMP_LANDMARK_KINDS.includes(kind)),
        ];
      },
      (error) => {
        console.error(error);
      },
    );
  return jumpLandmarks;
};
