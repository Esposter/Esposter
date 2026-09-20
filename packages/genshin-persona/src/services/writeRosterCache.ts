import type { Character } from "#src/models/Character";

import { ROSTER_CACHE_PREFIX, STATE_DIRECTORY } from "#src/services/constants";
import { getRosterCachePath } from "#src/services/getRosterCachePath";
import { writeStateFile } from "#src/services/writeStateFile";
import { readdirSync, rmSync } from "node:fs";
import { basename, join } from "node:path";

// The cache of the version being written replaces every other, so a machine carries one roster rather than one per
// version it has ever installed
export const writeRosterCache = (version: string, roster: Character[]): void => {
  const cachePath = getRosterCachePath(version);
  writeStateFile(cachePath, JSON.stringify(roster));
  const currentName = basename(cachePath);
  for (const entry of readdirSync(STATE_DIRECTORY))
    if (entry.startsWith(ROSTER_CACHE_PREFIX) && entry !== currentName) rmSync(join(STATE_DIRECTORY, entry));
};
