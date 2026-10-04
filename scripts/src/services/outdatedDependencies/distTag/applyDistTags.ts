import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";

import { getDistTag } from "#src/services/outdatedDependencies/distTag/getDistTag";

// Every entry, a dist-tag one carrying the tag and the version the lockfile resolved it to: the specifier names no
// Version to compare, so the registry reads the resolution as current and asks for the tag in place of `latest`.
export const applyDistTags = (entries: DependencyEntry[], resolvedVersions: Map<string, string>): DependencyEntry[] =>
  entries.map((entry) => {
    const distTag = getDistTag(entry.specifier);
    const resolved = resolvedVersions.get(entry.packageName);
    return distTag && resolved ? { ...entry, followTag: distTag, resolved } : entry;
  });
