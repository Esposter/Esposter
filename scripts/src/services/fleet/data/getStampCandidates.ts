import type { ChangedDirectory } from "#src/models/fleet/data/ChangedDirectory";

import { PROVENANCE_NAME, PROVENANCE_SIDECAR_SUFFIX } from "#src/services/provenance/constants";
import { posix } from "node:path";

// The stamps a copy reads from the source before it chooses a file: the folder stamps of each changed directory and of
// Every directory above it, since a folder's stamp covers its subtree, and the sidecars the source lists beside its files
export const getStampCandidates = (changed: ChangedDirectory[]): string[] => {
  const candidates = new Set<string>();
  for (const { directory, source } of changed) {
    const segments = directory.split("/");
    for (let depth = 0; depth <= segments.length; depth++)
      candidates.add(posix.join(...segments.slice(0, depth), PROVENANCE_NAME));
    for (const { name } of source)
      if (name.endsWith(PROVENANCE_SIDECAR_SUFFIX)) candidates.add(posix.join(directory, name));
  }
  return [...candidates];
};
