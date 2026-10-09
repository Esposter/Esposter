import type { RegionData } from "#src/models/world/RegionData";

import { regionDataSchema } from "#src/models/world/RegionData";
import { DATA_FETCH_TIMEOUT_MS } from "#src/services/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A region's data as the host serves it, rejected when its fetch fails, does not answer in time or fails its schema
export const readRegionData = async (regionDataBaseUrl: string, id: string): Promise<RegionData> => {
  const url = `/${regionDataBaseUrl}/${id}.json`;
  const response = await fetch(url, { signal: AbortSignal.timeout(DATA_FETCH_TIMEOUT_MS) });
  if (!response.ok)
    throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.status} ${response.statusText}`);
  // A server falling back to a page for a missing file answers 200 with HTML, which fails here or at the schema
  const regionJson: unknown = await response.json();
  return regionDataSchema.parse(regionJson);
};
