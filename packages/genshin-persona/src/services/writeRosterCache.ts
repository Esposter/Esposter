import type { Character } from "#src/models/Character";

import { ROSTER_CACHE_EXTENSION, ROSTER_CACHE_PREFIX, STATE_DIRECTORY } from "#src/services/constants";
import { getRosterCachePath } from "#src/services/getRosterCachePath";
import { writeStateFile } from "#src/services/writeStateFile";
import { readdirSync, rmSync } from "node:fs";
import { basename, join } from "node:path";

// The cache being written replaces every other, so a machine carries one roster rather than one per version it has
// Ever installed and one per language it has ever read in. A cache is swept by its own extension rather than by
// The prefix alone, because a temp sibling carries the prefix too and the one being written belongs to whichever
// Session is writing it: two first sessions starting at once would otherwise leave one of them renaming a file
// The other had just deleted
export const writeRosterCache = (version: string, language: string, roster: Character[]): void => {
  const cachePath = getRosterCachePath(version, language);
  writeStateFile(cachePath, JSON.stringify(roster));
  const currentName = basename(cachePath);
  for (const entry of readdirSync(STATE_DIRECTORY))
    if (entry.startsWith(ROSTER_CACHE_PREFIX) && entry.endsWith(ROSTER_CACHE_EXTENSION) && entry !== currentName)
      rmSync(join(STATE_DIRECTORY, entry));
};
