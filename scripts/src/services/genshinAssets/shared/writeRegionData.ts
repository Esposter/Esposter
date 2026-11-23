import type { DryRunOptions } from "#src/models/shared/DryRunOptions";

import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { checkIsJumpKind, REGION_LANDMARKS_SUFFIX } from "genshin-world";

// Writes a region's data file and the landmarks file beside it, which holds the region's jump landmarks and nothing else.
// The world's start reads that file and no region's whole file. Every region file is written here, so the landmarks file
// Cannot drift from the data it is cut from. Returns the data file's path
export const writeRegionData = async (
  relativePath: string,
  data: { landmarks: { kind?: string }[] } & Record<string, unknown>,
  { isDryRun = false }: Partial<DryRunOptions> = {},
): Promise<string> => {
  const path = await writeWorldData(relativePath, data, { isDryRun });
  const landmarks = data.landmarks.filter(({ kind }) => kind !== undefined && checkIsJumpKind(kind));
  await writeWorldData(relativePath.replace(/\.json$/u, REGION_LANDMARKS_SUFFIX), { landmarks }, { isDryRun });
  return path;
};
