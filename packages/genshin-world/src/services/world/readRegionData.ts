import type { RegionData } from "#src/models/world/RegionData";

import { regionDataSchema } from "#src/models/world/RegionData";
import { readJson } from "#src/services/shared/readJson";

// A region's data as the host serves it, rejected when its fetch fails, does not answer in time or fails its schema
export const readRegionData = async (regionDataBaseUrl: string, id: string): Promise<RegionData> =>
  regionDataSchema.parse(await readJson(`/${regionDataBaseUrl}/${id}.json`));
