import type { ManifestDependency } from "#scripts/outdatedDependencies/models/ManifestDependency";
import type { ManifestFile } from "#scripts/outdatedDependencies/models/ManifestFile";

import { DEPENDENCY_FIELDS } from "#scripts/outdatedDependencies/constants";

export const getManifestDependencies = (manifests: ManifestFile[]): ManifestDependency[] => {
  const manifestDependencies: ManifestDependency[] = [];

  for (const { manifest, path } of manifests) {
    const { name } = manifest;
    if (name === undefined) continue;

    for (const field of DEPENDENCY_FIELDS)
      for (const [pkg, specifier] of Object.entries(manifest[field] ?? {}))
        manifestDependencies.push({ field, manifestName: name, manifestPath: path, pkg, specifier });
  }

  return manifestDependencies;
};
