import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";
import type { ManifestFile } from "#src/models/outdatedDependencies/manifest/ManifestFile";

import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";

export const getEngineEntries = (manifests: ManifestFile[]): DependencyEntry[] => {
  const entryMap = new Map<string, DependencyEntry>();

  for (const { manifest } of manifests)
    for (const [packageName, specifier] of Object.entries(manifest.engines ?? {}))
      entryMap.set(`${packageName}@${specifier}`, { group: DependencyGroup.Engines, packageName, specifier });

  return [...entryMap.values()];
};
