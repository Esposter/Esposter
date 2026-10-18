import type { ClientBundleBytes } from "#src/models/dependencies/score/ClientBundleBytes";
import type { ClientBundleReport } from "#src/models/dependencies/score/ClientBundleReport";
import type { WorkspacePackage } from "#src/models/dependencies/score/WorkspacePackage";

import { getModuleOwner } from "#src/services/dependencies/score/getModuleOwner";

// Every package's gzipped bytes in the app's client bundle, each module's bytes given to the package that owns it. The
// Bundles holding the module the report marks as the entry are the entry chunk, whose bytes are also counted apart
export const getClientBundleBytes = (
  { nodeMetas, nodeParts }: ClientBundleReport,
  workspacePackages: WorkspacePackage[],
): Map<string, ClientBundleBytes> => {
  const entryBundleNames = new Set(
    Object.values(nodeMetas)
      .filter(({ isEntry }) => isEntry)
      .flatMap(({ moduleParts }) => Object.keys(moduleParts)),
  );
  const packageNameBytesMap = new Map<string, ClientBundleBytes>();

  for (const { id, moduleParts } of Object.values(nodeMetas)) {
    const parts = Object.entries(moduleParts);
    if (parts.length === 0) continue;

    const packageName = getModuleOwner(id, workspacePackages);
    const packageBytes = packageNameBytesMap.get(packageName) ?? { bytes: 0, entryBytes: 0 };
    for (const [bundleName, partUid] of parts) {
      const gzipLength = nodeParts[partUid]?.gzipLength ?? 0;
      packageBytes.bytes += gzipLength;
      if (entryBundleNames.has(bundleName)) packageBytes.entryBytes += gzipLength;
    }
    packageNameBytesMap.set(packageName, packageBytes);
  }

  return packageNameBytesMap;
};
