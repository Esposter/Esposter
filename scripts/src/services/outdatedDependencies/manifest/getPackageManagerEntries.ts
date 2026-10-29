import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";
import type { ManifestFile } from "#src/models/shared/ManifestFile";

import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";
import { PACKAGE_MANAGER_REGEX } from "#src/services/shared/constants";

export const getPackageManagerEntries = (manifests: ManifestFile[]): DependencyEntry[] =>
  manifests.flatMap(({ manifest: { packageManager } }) => {
    const groups = packageManager?.match(PACKAGE_MANAGER_REGEX)?.groups;
    return groups?.packageName && groups.version
      ? [{ group: DependencyGroup.PackageManager, packageName: groups.packageName, specifier: groups.version }]
      : [];
  });
