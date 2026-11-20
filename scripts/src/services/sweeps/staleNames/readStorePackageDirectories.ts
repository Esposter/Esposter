import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getPackageJsonPaths } from "#src/services/shared/getPackageJsonPaths";
import { getContainingModulesDirectory } from "#src/services/sweeps/staleNames/getContainingModulesDirectory";
import { readLinkedDirectories } from "#src/services/sweeps/staleNames/readLinkedDirectories";
import { dirname, join } from "node:path";

// The packages the install resolved, each as the real directory its link points to. The walk starts from every
// Project's own `node_modules`, where a direct dependency is a link into the store, and follows each package to the
// Dependencies that sit beside it in the `node_modules` folder holding it. That reaches the same set under both
// Layouts: the per-project store keeps a package beside its dependencies in `node_modules/.pnpm`, and the global
// Virtual store keeps them beside it under its own `links` folder, which the workspace reaches only through its links
export const readStorePackageDirectories = (): string[] => {
  const packageDirectories = new Set<string>();
  const pending = getPackageJsonPaths(REPOSITORY_ROOT).flatMap((packageJsonPath) =>
    readLinkedDirectories(join(dirname(packageJsonPath), "node_modules")),
  );
  for (let packageDirectory = pending.pop(); packageDirectory !== undefined; packageDirectory = pending.pop()) {
    if (packageDirectories.has(packageDirectory)) continue;

    packageDirectories.add(packageDirectory);
    pending.push(...readLinkedDirectories(getContainingModulesDirectory(packageDirectory)));
  }
  return [...packageDirectories].toSorted();
};
