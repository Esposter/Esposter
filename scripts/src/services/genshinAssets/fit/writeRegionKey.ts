import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { DryRunOptions } from "#src/models/shared/DryRunOptions";

import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { GameDataset } from "genshin-world";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Writes one key of a region's data file and keeps the rest of it, returning the note of the write: the file's path,
// The summary given and, on a dry run, that nothing was written
export const writeRegionKey = async (
  component: DerivedAssetComponent,
  key: string,
  value: unknown,
  summary: string,
  { isDryRun }: DryRunOptions,
): Promise<string> => {
  const regionFile = join(GameDataset.Regions, `${component}.json`);
  const regionData = parseMachineJson<Record<string, unknown>>(
    await readFile(join(WORLD_DATA_DIRECTORY, regionFile), "utf8"),
  );
  const path = await writeWorldData(regionFile, { ...regionData, [key]: value }, { isDryRun });
  return `${path}: ${summary}${isDryRun ? ", nothing written" : ""}`;
};
