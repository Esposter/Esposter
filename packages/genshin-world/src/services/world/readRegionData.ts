import type { RegionData } from "#src/models/world/RegionData";

import { regionDataSchema } from "#src/models/world/RegionData";
import { readJson } from "#src/services/shared/readJson";
import { getResultAsync } from "@esposter/shared";

const readRegionDataOnce = async (regionDataBaseUrl: string, id: string): Promise<RegionData> =>
  regionDataSchema.parse(await readJson(`/${regionDataBaseUrl}/${id}.json`));

// Each region's read, held by its base and id, so the landmarks the world lists for its jumps and its reach read share
// One fetch of a region. A read that fails is dropped, so the next ask fetches it again
const regionDataReads = new Map<string, Promise<RegionData>>();

// A region's data as the host serves it, rejected when its fetch fails, does not answer in time or fails its schema
export const readRegionData = async (regionDataBaseUrl: string, id: string): Promise<RegionData> => {
  const key = `${regionDataBaseUrl}/${id}`;
  const held = regionDataReads.get(key);
  if (held) return held;
  const read = readRegionDataOnce(regionDataBaseUrl, id);
  regionDataReads.set(key, read);
  const result = await getResultAsync(() => read);
  if (result.isErr()) {
    regionDataReads.delete(key);
    throw result.error;
  }
  return result.value;
};
