import type { WorkspacePackage } from "#src/models/dependencies/score/WorkspacePackage";
import type { ManifestFile } from "#src/models/shared/ManifestFile";

import { APP_DIRECTORY } from "#src/services/dependencies/score/constants";
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
