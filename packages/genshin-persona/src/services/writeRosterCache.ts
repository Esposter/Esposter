import type { Character } from "#src/models/Character";

import { ROSTER_CACHE_PREFIX, STATE_DIRECTORY } from "#src/services/constants";
import { getRosterCachePath } from "#src/services/getRosterCachePath";
import { writeStateFile } from "#src/services/writeStateFile";
import { readdirSync, rmSync } from "node:fs";
import { basename, join } from "node:path";

// The cache being written replaces every other, so a machine carries one roster rather than one per version it has
// Ever installed and one per language it has ever read in
export const writeRosterCache = (version: string, language: string, roster: Character[]): void => {
  const cachePath = getRosterCachePath(version, language);
  writeStateFile(cachePath, JSON.stringify(roster));
  const currentName = basename(cachePath);
  for (const entry of readdirSync(STATE_DIRECTORY))
    if (entry.startsWith(ROSTER_CACHE_PREFIX) && entry !== currentName) rmSync(join(STATE_DIRECTORY, entry));
};
