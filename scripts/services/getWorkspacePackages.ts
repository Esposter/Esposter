import type { WorkspacePackage } from "#scripts/models/WorkspacePackage";
import type { PackageManifest } from "@esposter/configuration";

import { getPackageJsonPaths } from "#scripts/services/getPackageJsonPaths";
import { readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";

// Every manifest under `packages/`, paired with the directory that names it — the repo refers to a package by
// Its directory far more often than by its `name`, and only the directory is guaranteed to exist.
//
// `getPackageJsonPaths` leads with the root manifest so a dependency check can read it too. The root is not a
// Workspace package, so it is dropped by identity rather than by position, and the rest are sorted because
// `readdirSync` order is the filesystem's and this feeds a committed artifact.
export const getWorkspacePackages = (root: string): WorkspacePackage[] => {
  const rootPackageJsonPath = resolve(root, "package.json");
  return getPackageJsonPaths(root)
    .filter((packageJsonPath) => packageJsonPath !== rootPackageJsonPath)
    .toSorted()
    .map((packageJsonPath) => ({
      directory: basename(dirname(packageJsonPath)),
      // eslint-disable-next-line no-restricted-syntax -- a package manifest carries no dates, and reading one through `jsonDateParse` would make this script wait on `@esposter/shared` being built
      manifest: JSON.parse(readFileSync(packageJsonPath, "utf8")) as PackageManifest,
    }));
};
