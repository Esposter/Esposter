import type { InstalledPackage } from "#src/models/dependencies/score/InstalledPackage";

import { readPackageAt } from "#src/services/dependencies/score/readPackageAt";
import { NODE_MODULES_DIRECTORY } from "#src/services/dependencies/score/constants";
import { dirname, join } from "node:path";

// The copy a workspace that lists the package installed, read from its own `node_modules`: `pnpm ls` reports the
// Tree without the files a package's bytes are counted from
export const findInstalledPackage = (packageName: string, manifestPaths: string[]): InstalledPackage | undefined => {
  for (const manifestPath of manifestPaths) {
    const installed = readPackageAt(join(dirname(manifestPath), NODE_MODULES_DIRECTORY, packageName));
    if (installed !== undefined) return installed;
  }
  return undefined;
};
