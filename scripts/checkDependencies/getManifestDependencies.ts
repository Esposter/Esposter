import type { Manifest } from "#scripts/checkDependencies/models/Manifest";
import type { ManifestDependency } from "#scripts/checkDependencies/models/ManifestDependency";

import { DEPENDENCY_FIELDS } from "#scripts/checkDependencies/constants";

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
