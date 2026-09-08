import type { WorkspacePackage } from "#src/models/WorkspacePackage";
import type { PackageManifest } from "@esposter/configuration";

import { getPackageJsonPaths } from "#src/services/getPackageJsonPaths";
import { parseMachineJson } from "#src/services/parseMachineJson";
import { readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";

// Every manifest under the workspace roots, paired with the directory that names it and the root it sits under — the repo refers to a package by
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
      manifest: parseMachineJson<PackageManifest>(readFileSync(packageJsonPath, "utf8")),
      workspaceDirectory: basename(dirname(dirname(packageJsonPath))),
    }));
};
