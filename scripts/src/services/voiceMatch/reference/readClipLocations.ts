import type { ClipLocation } from "#src/models/voiceMatch/ClipLocation";

import { PACKAGE_EXTENSION } from "#src/services/voiceMatch/constants";
import { readAkpkEntries } from "#src/services/voiceMatch/reference/readAkpkEntries";
import { readdirSync } from "node:fs";
import { join } from "node:path";

// Every clip in a language track by its id, from the tables of every package in the folder — a hundred-odd
// Packages holding tens of gigabytes, indexed in under a second because only their tables are read
export const readClipLocations = (directory: string): Map<bigint, ClipLocation> => {
  const clipLocationMap = new Map<bigint, ClipLocation>();
  const packageNames = readdirSync(directory).filter((name) => name.endsWith(PACKAGE_EXTENSION));
  for (const packageName of packageNames) {
    const path = join(directory, packageName);
    for (const entry of readAkpkEntries(path)) clipLocationMap.set(entry.id, { entry, path });
  }

  return clipLocationMap;
};
