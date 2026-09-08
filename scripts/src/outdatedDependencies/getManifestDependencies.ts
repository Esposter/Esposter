import type { ManifestDependency } from "#src/outdatedDependencies/models/ManifestDependency";
import type { ManifestFile } from "#src/outdatedDependencies/models/ManifestFile";

import { DependencyFields } from "#src/models/DependencyField";

export const getManifestDependencies = (manifests: ManifestFile[]): ManifestDependency[] => {
  const manifestDependencies: ManifestDependency[] = [];

  for (const { manifest, path } of manifests) {
    const { name } = manifest;
    if (name === undefined) continue;

    for (const field of DependencyFields)
      for (const [pkg, specifier] of Object.entries(manifest[field] ?? {}))
        manifestDependencies.push({ field, manifestName: name, manifestPath: path, pkg, specifier });
  }

  return manifestDependencies;
};
