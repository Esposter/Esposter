import type { InstalledPackage } from "#src/models/dependencies/score/InstalledPackage";

import { countModuleGraphLines } from "#src/services/dependencies/score/countModuleGraphLines";
import { getNodeModulesDirectory } from "#src/services/dependencies/score/getNodeModulesDirectory";
import { readPackageAt } from "#src/services/dependencies/score/readPackageAt";
import { realpathSync } from "node:fs";
import { join } from "node:path";

// The lines of every package the installed one declares, each counted as its own module graph. Under pnpm a package's
// Dependencies sit beside its realpath in the store, so they are found from there rather than from the workspace.
export const countDependencyLines = (packageName: string, installed: InstalledPackage): number => {
  const nodeModulesDirectory = getNodeModulesDirectory(packageName, realpathSync(installed.directory));

  let lines = 0;
  for (const dependencyName of Object.keys(installed.manifest.dependencies ?? {})) {
    const dependency = readPackageAt(join(nodeModulesDirectory, ...dependencyName.split("/")));
    if (dependency !== undefined) lines += countModuleGraphLines(dependency.directory, dependency.manifest);
  }
  return lines;
};
