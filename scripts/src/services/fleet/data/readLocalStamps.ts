import type { StampEntry } from "#src/models/fleet/data/StampEntry";

import { STAMP_CONCURRENCY } from "#src/services/fleet/data/constants";
import { readStamp } from "#src/services/provenance/readStamp";
import { forEachConcurrently } from "#src/services/shared/forEachConcurrently";
import { join } from "node:path";

// The stamps among the paths this machine holds, read from its own files before any file they cover is chosen, a bounded
// Number at a time
export const readLocalStamps = async (localDirectory: string, paths: string[]): Promise<StampEntry[]> => {
  const stamps: StampEntry[] = [];
  await forEachConcurrently(paths, STAMP_CONCURRENCY, async (path) => {
    const provenance = await readStamp(join(localDirectory, path));
    if (provenance) stamps.push({ path, provenance });
  });
  return stamps;
};
