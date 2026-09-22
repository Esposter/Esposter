import type { ManifestFile } from "#src/models/outdatedDependencies/manifest/ManifestFile";
import type { ManifestDependency } from "#src/models/outdatedDependencies/shared/ManifestDependency";

import { DependencyFields } from "#src/models/shared/DependencyField";

export const getManifestDependencies = (manifests: ManifestFile[]): ManifestDependency[] => {
  const manifestDependencies: ManifestDependency[] = [];

  for (const { manifest, path } of manifests) {
    const { name } = manifest;
    if (name === undefined) continue;

    for (const field of DependencyFields)
      for (const [packageName, specifier] of Object.entries(manifest[field] ?? {}))
        manifestDependencies.push({ field, manifestName: name, manifestPath: path, packageName, specifier });
  }

  return manifestDependencies;
};
