import type { Manifest } from "#scripts/outdatedDependencies/models/Manifest";
import type { ManifestDependency } from "#scripts/outdatedDependencies/models/ManifestDependency";

import { DEPENDENCY_FIELDS } from "#scripts/outdatedDependencies/constants";

export const getManifestDependencies = (manifests: Manifest[]): ManifestDependency[] => {
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
