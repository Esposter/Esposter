import type { Character } from "#src/models/Character";

import { getRosterCachePath } from "#src/services/getRosterCachePath";
import { existsSync, readFileSync } from "node:fs";

export const readRosterCache = (version: string, language: string): Character[] | undefined => {
  const cachePath = getRosterCachePath(version, language);
  // The file is the plugin's own, written from the roster it is read back into, and holds no date
  // oxlint-disable-next-line no-restricted-properties -- this JSON holds no dates, so the reviver has nothing to revive
  if (existsSync(cachePath)) return JSON.parse(readFileSync(cachePath, "utf8")) as Character[];
  else return undefined;
};
