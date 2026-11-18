import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";

import { DependencyGroup } from "#src/models/outdatedDependencies/shared/DependencyGroup";

const CATALOG_SPECIFIER = "catalog:";
// A key's segments are split at a `>` that follows a package name, so a range's own `>` (`@>=1`, `|| >2`) stays in its segment
const PARENT_SEPARATOR_REGEX = /(?<![\s@])>/u;
// The package a segment names, before the version selector it may carry (`minimatch@<11.0.1`)
const PACKAGE_NAME_REGEX = /^(?:@[^/]+\/)?[^@]+/u;

// The overrides naming a version of their own. One pointing at the catalog, or restating the catalog's specifier for
// The same package, is checked as that catalog entry already. A key scoped under a parent (`vite-plus>oxfmt`) names
// The package after its last parent, and a key selecting versions (`minimatch@<11.0.1`) names it without the selector
export const getOverrideEntries = (
  overrideEntries: DependencyEntry[],
  catalogEntries: DependencyEntry[],
): DependencyEntry[] => {
  const catalogSpecifierMap = new Map(catalogEntries.map(({ packageName, specifier }) => [packageName, specifier]));
  return overrideEntries.flatMap(({ packageName: key, specifier }) => {
    const packageName = key.split(PARENT_SEPARATOR_REGEX).at(-1)?.match(PACKAGE_NAME_REGEX)?.[0] ?? key;
    return specifier === CATALOG_SPECIFIER || catalogSpecifierMap.get(packageName) === specifier
      ? []
      : [{ group: DependencyGroup.Overrides, packageName, specifier }];
  });
};
