import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";

import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";

const CATALOG_SPECIFIER = "catalog:";

// The overrides naming a version of their own. One pointing at the catalog, or restating the catalog's specifier for
// The same package, is checked as that catalog entry already. A key scoped under a parent (`vite-plus>oxfmt`) names
// The package after its last `>`
export const getOverrideEntries = (
  overrideEntries: DependencyEntry[],
  catalogEntries: DependencyEntry[],
): DependencyEntry[] => {
  const catalogSpecifierMap = new Map(catalogEntries.map(({ packageName, specifier }) => [packageName, specifier]));
  return overrideEntries.flatMap(({ packageName: key, specifier }) => {
    const packageName = key.slice(key.lastIndexOf(">") + 1);
    return specifier === CATALOG_SPECIFIER || catalogSpecifierMap.get(packageName) === specifier
      ? []
      : [{ group: DependencyGroup.Overrides, packageName, specifier }];
  });
};
