import type { PackageManifest } from "#src/models/PackageManifest";

import { BARREL_FILE, SOURCE_DIRECTORY_NAME } from "#src/services/constants";

// The `src`-relative folders and modules the root barrel leaves out, each read off a subpath's `source` arm in the
// Package manifest. An arm whose source is a folder's `index.ts` leaves out the folder, and any other source leaves out
// Its one module. The root arm and the manifest's own arm name no subpath, and an arm whose source lies outside `src`
// Names no module of the barrel
export const getSubpathExclusions = (manifest: PackageManifest): string[] => {
  const sourcePrefix = `./${SOURCE_DIRECTORY_NAME}/`;
  const indexPath = `/${BARREL_FILE}`;
  return Object.entries(manifest.exports ?? {}).flatMap(([arm, target]) => {
    const source = typeof target === "string" ? target : target.source;
    if (arm === "." || arm === "./package.json" || !source?.startsWith(sourcePrefix)) return [];

    const path = source.slice(sourcePrefix.length);
    return [path.endsWith(indexPath) ? path.slice(0, -indexPath.length) : path];
  });
};
