import type { InstalledPackage } from "#src/models/dependencies/score/InstalledPackage";

import { getNodeModulesDirectory } from "#src/services/dependencies/score/getNodeModulesDirectory";
import { readPackageAt } from "#src/services/dependencies/score/readPackageAt";
import { realpathSync } from "node:fs";
import { join } from "node:path";

// The realpath of every installed package the installed one reaches through its dependencies, itself first and each
// Once however many packages reach it, so a dependency shared by two branches of the tree is one directory
export const getInstalledClosure = (packageName: string, installed: InstalledPackage): Set<string> => {
  const ownRealDirectory = realpathSync(installed.directory);
  const realDirectories = new Set<string>([ownRealDirectory]);
  const pending = [{ directory: ownRealDirectory, manifest: installed.manifest, packageName }];

  for (const current of pending) {
    const nodeModulesDirectory = getNodeModulesDirectory(current.packageName, current.directory);
    for (const dependencyName of Object.keys(current.manifest.dependencies ?? {})) {
      const dependency = readPackageAt(join(nodeModulesDirectory, ...dependencyName.split("/")));
      if (dependency === undefined) continue;

      const dependencyRealDirectory = realpathSync(dependency.directory);
      if (realDirectories.has(dependencyRealDirectory)) continue;

      realDirectories.add(dependencyRealDirectory);
      pending.push({ directory: dependencyRealDirectory, manifest: dependency.manifest, packageName: dependencyName });
    }
  }

  return realDirectories;
};
