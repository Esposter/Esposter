import type { WorkspacePackage } from "#src/models/WorkspacePackage";
import type { PackageManifest } from "@esposter/configuration";

import { getPackageJsonPaths } from "#src/services/getPackageJsonPaths";
import { parseMachineJson } from "#src/services/parseMachineJson";
import { readFileSync } from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";

// Every member's manifest, as `pnpm-workspace.yaml` declares them, paired with the directory that names it and
// The workspace directory it sits under — the repo refers to a package by its directory far more often than by
// Its `name`, and only the directory is guaranteed to exist.
//
// `getPackageJsonPaths` leads with the root manifest so a dependency check can read it too. The root is not a
// Workspace package, so it is dropped by identity rather than by position, and the rest are sorted because
// `readdirSync` order is the filesystem's and this feeds a committed artifact.
export const getWorkspacePackages = (root: string): WorkspacePackage[] => {
  const rootPackageJsonPath = resolve(root, "package.json");
  return getPackageJsonPaths(root)
    .filter((packageJsonPath) => packageJsonPath !== rootPackageJsonPath)
    .toSorted()
    .map((packageJsonPath) => {
      const packageDirectory = dirname(packageJsonPath);
      return {
        directory: basename(packageDirectory),
        manifest: parseMachineJson<PackageManifest>(readFileSync(packageJsonPath, "utf8")),
        // Empty for a member that sits at the repository root rather than under a workspace directory: there is
        // No directory to group it by, and the graph draws it outside the clusters rather than inventing one.
        workspaceDirectory: relative(root, dirname(packageDirectory)),
      };
    });
};
