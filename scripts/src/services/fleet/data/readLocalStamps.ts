import type { StampEntry } from "#src/models/fleet/data/StampEntry";

import { readStamp } from "#src/services/provenance/readStamp";
import { join } from "node:path";

// The stamps among the paths this machine holds, read from its own files before any file they cover is chosen
export const readLocalStamps = async (localDirectory: string, paths: string[]): Promise<StampEntry[]> => {
  const stamps = await Promise.all(
    paths.map(async (path) => ({ path, provenance: await readStamp(join(localDirectory, path)) })),
  );
  return stamps.filter((stamp): stamp is StampEntry => stamp.provenance !== undefined);
};
