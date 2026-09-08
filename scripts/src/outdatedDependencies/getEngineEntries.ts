import type { DependencyEntry } from "#src/outdatedDependencies/models/DependencyEntry";
import type { ManifestFile } from "#src/outdatedDependencies/models/ManifestFile";

export const getEngineEntries = (manifests: ManifestFile[]): DependencyEntry[] => {
  const entryMap = new Map<string, DependencyEntry>();

  for (const { manifest } of manifests)
    for (const [pkg, specifier] of Object.entries(manifest.engines ?? {}))
      entryMap.set(`${pkg}@${specifier}`, { group: "engines", pkg, specifier });

  return [...entryMap.values()];
};
