import type { DependencyEntry } from "#src/models/outdatedDependencies/DependencyEntry";
import type { ManifestFile } from "#src/models/outdatedDependencies/ManifestFile";

import { DependencyGroup } from "#src/models/outdatedDependencies/DependencyGroup";

export const getEngineEntries = (manifests: ManifestFile[]): DependencyEntry[] => {
  const entryMap = new Map<string, DependencyEntry>();

  for (const { manifest } of manifests)
    for (const [packageName, specifier] of Object.entries(manifest.engines ?? {}))
      entryMap.set(`${packageName}@${specifier}`, { group: DependencyGroup.Engines, packageName, specifier });

  return [...entryMap.values()];
};
