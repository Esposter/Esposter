import type { ClientBundleReport } from "#src/models/dependencies/score/ClientBundleReport";
import type { WorkspacePackage } from "#src/models/dependencies/score/WorkspacePackage";

import { getModuleOwner } from "#src/services/dependencies/score/getModuleOwner";

// Every package's gzipped bytes in the app's client bundle, each module's bytes given to the package that owns it
export const getClientBundleBytes = (
  { nodeMetas, nodeParts }: ClientBundleReport,
  workspacePackages: WorkspacePackage[],
): Map<string, number> => {
  const packageNameBytesMap = new Map<string, number>();

  for (const { gzipLength, metaUid } of Object.values(nodeParts)) {
    const moduleId = nodeMetas[metaUid]?.id;
    if (moduleId === undefined) continue;

    const packageName = getModuleOwner(moduleId, workspacePackages);
    packageNameBytesMap.set(packageName, (packageNameBytesMap.get(packageName) ?? 0) + gzipLength);
  }

  return packageNameBytesMap;
};
