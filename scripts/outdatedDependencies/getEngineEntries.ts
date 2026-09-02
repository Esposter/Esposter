import type { DependencyEntry } from "#scripts/outdatedDependencies/models/DependencyEntry";
import type { ManifestFile } from "#scripts/outdatedDependencies/models/ManifestFile";

export const getEngineEntries = (manifests: ManifestFile[]): DependencyEntry[] => {
  const entriesByKey = new Map<string, DependencyEntry>();

  for (const { manifest } of manifests)
    for (const [pkg, specifier] of Object.entries(manifest.engines ?? {}))
      entriesByKey.set(`${pkg}@${specifier}`, { group: "engines", pkg, specifier });

  return [...entriesByKey.values()];
};
