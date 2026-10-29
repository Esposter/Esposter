import type { InstalledManifest } from "#src/models/dependencies/score/InstalledManifest";

import { countSourceLines } from "#src/services/dependencies/score/countSourceLines";
import { resolveEntryPath } from "#src/services/dependencies/score/resolveEntryPath";
import { resolve } from "node:path";

// The lines of every module a package's runtime reaches from its entry, each file counted once: a package that ships
// CJS, ESM and UMD builds of one module is counted as the one module it is
export const countModuleGraphLines = (packageDirectory: string, manifest: InstalledManifest): number => {
  const entryPath = resolveEntryPath(manifest);
  if (entryPath === undefined) return 0;

  return countSourceLines(resolve(packageDirectory, entryPath), new Set());
};
