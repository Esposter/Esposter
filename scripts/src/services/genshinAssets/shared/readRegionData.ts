import type { RegionDataFile } from "#src/models/genshinAssets/residents/RegionDataFile";

import { readWorldRecord } from "#src/services/genshinAssets/shared/readWorldRecord";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { join } from "node:path";

// A region's data file as the world package holds it, with the path it is written back to under the world package's
// Data
export const readRegionData = async (region: string): Promise<{ data: RegionDataFile; file: string }> => {
  const file = join("regions", `${region}.json`);
  const data = parseMachineJson<RegionDataFile>(await readWorldRecord(file));
  return { data, file };
};
