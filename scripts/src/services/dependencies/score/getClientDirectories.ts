import type { WorkspacePackage } from "#src/models/dependencies/score/WorkspacePackage";
import type { ManifestFile } from "#src/models/shared/ManifestFile";

import { APP_DIRECTORY, CLIENT_DIRECTORIES, TEST_FILE_REGEX } from "#src/services/dependencies/score/constants";
import { checkIsClientPath } from "#src/services/dependencies/score/checkIsClientPath";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { dirname, relative } from "node:path";

// Every workspace package other than the root and the app, by its directory from the repository root
export const getWorkspacePackages = (manifestFiles: ManifestFile[]): WorkspacePackage[] => {
  const workspacePackages: WorkspacePackage[] = [];

  for (const { manifest, path } of manifestFiles) {
    const directory = relative(REPOSITORY_ROOT, dirname(path)).replaceAll("\\", "/");
    if (manifest.name === undefined || directory === "" || directory === APP_DIRECTORY) continue;

    workspacePackages.push({ directory, packageName: manifest.name });
  }

  return workspacePackages;
};

// The folders that ship to the browser: the app's client folders, grown by every workspace package one of them imports,
// Since a package it imports ships with it. A test importing a package does not ship it, so it does not grow the set.
export const getClientDirectories = (
  workspacePackages: WorkspacePackage[],
  packageNameImportersMap: Map<string, Set<string>>,
): string[] => {
  const clientDirectories = [...CLIENT_DIRECTORIES];
  const clientPackageNames = new Set<string>();
  let isGrowing = true;

  while (isGrowing) {
    isGrowing = false;
    for (const { directory, packageName } of workspacePackages) {
      if (clientPackageNames.has(packageName)) continue;

      const importers = [...(packageNameImportersMap.get(packageName) ?? [])];
      if (!importers.some((path) => checkIsClientPath(path, clientDirectories) && !TEST_FILE_REGEX.test(path)))
        continue;

      clientPackageNames.add(packageName);
      clientDirectories.push(directory);
      isGrowing = true;
    }
  }

  return clientDirectories;
};
