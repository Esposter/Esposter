import type { RegionLandmarks } from "#src/models/world/JumpLandmark";

import { REGION_LANDMARKS_SUFFIX, regionLandmarksSchema } from "#src/models/world/JumpLandmark";
import { readJson } from "#src/services/shared/readJson";

// A region's landmarks file as the host serves it beside the region's data, rejected when its fetch fails or it fails
// Its schema. The world's start reads this and no region's whole data file
export const readRegionLandmarks = async (regionDataBaseUrl: string, id: string): Promise<RegionLandmarks> =>
  regionLandmarksSchema.parse(await readJson(`/${regionDataBaseUrl}/${id}${REGION_LANDMARKS_SUFFIX}`));
