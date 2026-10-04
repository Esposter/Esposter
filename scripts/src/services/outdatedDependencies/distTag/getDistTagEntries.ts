import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";

import { getDistTag } from "#src/services/outdatedDependencies/distTag/getDistTag";

// The entries a specifier points at a dist-tag, each carrying the tag and the version the lockfile resolved it to:
// The specifier names no version to compare, and `pnpm outdated` compares against `latest` whatever the tag, so a
// Nightly line's `5x` would be judged against the stable `latest` it is ahead of and never reported.
export const getDistTagEntries = (
  entries: DependencyEntry[],
  resolvedVersions: Map<string, string>,
): DependencyEntry[] => {
  const distTagEntries: DependencyEntry[] = [];

  for (const entry of entries) {
    const distTag = getDistTag(entry.specifier);
    const resolved = resolvedVersions.get(entry.packageName);
    if (distTag && resolved) distTagEntries.push({ ...entry, followTag: distTag, resolved });
  }

  return distTagEntries;
};
