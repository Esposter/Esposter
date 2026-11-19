import { PACKAGES_SECTION_ENDS, PACKAGES_SECTION_START } from "#src/services/outdatedDependencies/lock/constants";
import { sliceLockSection } from "#src/services/outdatedDependencies/lock/sliceLockSection";
import { takeOne } from "@esposter/shared";

// A package key two spaces in, quoted when it is scoped, its version followed by any peer suffix in parentheses
const PACKAGE_KEY_REGEX = /^ {2}'?(?<packageName>@?[^@'\s]+)@(?<version>\d[^'(:\s]*)/gmu;

// The version each package resolves to where it resolves to one only. A catalog entry the tree reaches through an
// `overrides:` reference alone has no row under `catalogs:`, and the override forcing every copy to one range is what
// Leaves it a single version here; a package at several versions names no one current version, so it is left out.
// The lockfile is several documents, the package manager's own lock ahead of the tree's, so the tree's packages are the
// Last section of the name
export const getLockPackageVersions = (lockYaml: string): Map<string, string> => {
  const versionsMap = new Map<string, Set<string>>();
  const treeLockYaml = lockYaml.slice(lockYaml.lastIndexOf(PACKAGES_SECTION_START));
  for (const { groups } of sliceLockSection(treeLockYaml, PACKAGES_SECTION_START, PACKAGES_SECTION_ENDS).matchAll(
    PACKAGE_KEY_REGEX,
  )) {
    if (!groups?.packageName || !groups.version) continue;
    const versions = versionsMap.get(groups.packageName) ?? new Set<string>();
    versions.add(groups.version);
    versionsMap.set(groups.packageName, versions);
  }
  return new Map(
    [...versionsMap].flatMap(([packageName, versions]) =>
      versions.size === 1 ? [[packageName, takeOne([...versions])] as const] : [],
    ),
  );
};
