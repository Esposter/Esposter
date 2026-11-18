import type { RegionData } from "#src/models/world/RegionData";

import { regionDataSchema } from "#src/models/world/RegionData";
import { readJson } from "#src/services/shared/readJson";
import { getResultAsync } from "@esposter/shared";

const readRegionDataOnce = async (regionDataBaseUrl: string, id: string): Promise<RegionData> =>
  regionDataSchema.parse(await readJson(`/${regionDataBaseUrl}/${id}.json`));

// Each region's read, held by its base and id, so a region asked for twice is fetched once. A read that fails is dropped,
// So the next ask fetches it again
const regionDataReads = new Map<string, Promise<RegionData>>();

// A region's data as the host serves it, rejected when its fetch fails, does not answer in time or fails its schema
export const readRegionData = (regionDataBaseUrl: string, id: string): Promise<RegionData> => {
  const key = `${regionDataBaseUrl}/${id}`;
  const held = regionDataReads.get(key);
  if (held) return held;
  const read = readRegionDataOnce(regionDataBaseUrl, id);
  regionDataReads.set(key, read);
  return getResultAsync(() => read).match(
    (regionData) => regionData,
    (error) => {
      regionDataReads.delete(key);
      throw error;
    },
  );
};
