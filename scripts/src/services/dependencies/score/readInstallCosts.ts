import type { InstallCost } from "#src/models/dependencies/score/InstallCost";
import type { InstalledPackage } from "#src/models/dependencies/score/InstalledPackage";

import { getDirectoryBytes } from "#src/services/dependencies/score/getDirectoryBytes";
import { getInstalledClosure } from "#src/services/dependencies/score/getInstalledClosure";
import { getOrCreate } from "@esposter/shared";

// What installing each catalog package adds. A dependency another catalog package also reaches is counted in full for
// Every package that reaches it, and flags both as shared, since the disk holds it once however many read it.
export const readInstallCosts = (packageNameInstalledMap: Map<string, InstalledPackage>): Map<string, InstallCost> => {
  const packageNameClosureMap = new Map<string, Set<string>>();
  const reachCountMap = new Map<string, number>();
  const directoryBytesMap = new Map<string, number>();

  for (const [packageName, installed] of packageNameInstalledMap) {
    const closure = getInstalledClosure(packageName, installed);
    packageNameClosureMap.set(packageName, closure);
    for (const realDirectory of closure) reachCountMap.set(realDirectory, (reachCountMap.get(realDirectory) ?? 0) + 1);
  }

  const packageNameInstallCostMap = new Map<string, InstallCost>();
  for (const [packageName, closure] of packageNameClosureMap) {
    const [ownRealDirectory = ""] = closure;
    let bytes = 0;
    let isShared = false;

    for (const realDirectory of closure) {
      bytes += getOrCreate(directoryBytesMap, realDirectory, () => getDirectoryBytes(realDirectory));
      if (realDirectory !== ownRealDirectory && (reachCountMap.get(realDirectory) ?? 0) > 1) isShared = true;
    }
    packageNameInstallCostMap.set(packageName, { bytes, isShared });
  }

  return packageNameInstallCostMap;
};
