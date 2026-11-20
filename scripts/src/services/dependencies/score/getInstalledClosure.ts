import type { InstalledPackage } from "#src/models/dependencies/score/InstalledPackage";

import { readPackageAt } from "#src/services/dependencies/score/readPackageAt";
import { getContainingModulesDirectory } from "#src/services/shared/getContainingModulesDirectory";
import { walkRealDirectories } from "#src/services/shared/walkRealDirectories";
import { realpathSync } from "node:fs";
import { join } from "node:path";

// The realpath of every installed package the installed one reaches through its dependencies, itself first and each
// Once however many packages reach it, so a dependency shared by two branches of the tree is one directory
export const getInstalledClosure = (installed: InstalledPackage): Set<string> => {
  const root = { directory: realpathSync(installed.directory), manifest: installed.manifest };
  const packages = walkRealDirectories(
    [root],
    (current) => current.directory,
    (current) => {
      const nodeModulesDirectory = getContainingModulesDirectory(current.directory);
      return Object.keys(current.manifest.dependencies ?? {}).flatMap((dependencyName) => {
        const dependency = readPackageAt(join(nodeModulesDirectory, ...dependencyName.split("/")));
        if (dependency === undefined) return [];

        return [{ directory: realpathSync(dependency.directory), manifest: dependency.manifest }];
      });
    },
  );
  return new Set(packages.map((current) => current.directory));
};
