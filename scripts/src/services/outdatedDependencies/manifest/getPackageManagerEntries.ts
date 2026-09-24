import type { ManifestFile } from "#src/models/outdatedDependencies/manifest/ManifestFile";
import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";

import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";

// `<name>@<version>` with an optional `+sha512.<hex>` suffix corepack verifies the download against, which is no
// Part of the version the registry is asked about
const PACKAGE_MANAGER_REGEX = /^(?<packageName>[^@]+)@(?<version>[^+]+)/u;

export const getPackageManagerEntries = (manifests: ManifestFile[]): DependencyEntry[] =>
  manifests.flatMap(({ manifest: { packageManager } }) => {
    const groups = packageManager?.match(PACKAGE_MANAGER_REGEX)?.groups;
    return groups?.packageName && groups.version
      ? [{ group: DependencyGroup.PackageManager, packageName: groups.packageName, specifier: groups.version }]
      : [];
  });
