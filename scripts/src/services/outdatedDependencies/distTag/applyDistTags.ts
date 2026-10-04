import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";

import { getDistTag } from "#src/services/outdatedDependencies/distTag/getDistTag";

// Every entry, a dist-tag one carrying the tag and the version the lockfile resolved it to: the specifier names no
// Version to compare, so the registry reads the resolution as current and asks for the tag in place of `latest`.
// A dist-tag entry the lockfile resolved nothing for is left out, since it then has no version to compare at all.
export const applyDistTags = (entries: DependencyEntry[], resolvedVersions: Map<string, string>): DependencyEntry[] =>
  entries.flatMap((entry) => {
    const distTag = getDistTag(entry.specifier);
    if (!distTag) return [entry];

    const resolved = resolvedVersions.get(entry.packageName);
    return resolved ? [{ ...entry, followTag: distTag, resolved }] : [];
  });
