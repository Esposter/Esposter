import type { DependencyEntry } from "#scripts/outdatedDependencies/models/DependencyEntry";
import type { Manifest } from "#scripts/outdatedDependencies/models/Manifest";

export const getEngineEntries = (manifests: Manifest[]): DependencyEntry[] => {
  const entriesByKey = new Map<string, DependencyEntry>();

  for (const { manifest } of manifests)
    for (const [pkg, specifier] of Object.entries(manifest.engines ?? {}))
      entriesByKey.set(`${pkg}@${specifier}`, { group: "engines", pkg, specifier });

  return [...entriesByKey.values()];
};
