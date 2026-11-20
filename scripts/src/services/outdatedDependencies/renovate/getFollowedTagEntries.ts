import type { RenovateRule } from "#src/models/outdatedDependencies/renovate/RenovateRule";
import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";

import { getLastSettingRule } from "#src/services/outdatedDependencies/renovate/getLastSettingRule";

// The catalog entries a `followTag` rule points at a dist-tag, each carrying that tag: Renovate proposes the
// Tag's version rather than `latest`, so the report asks the registry for the same thing. The last rule following a
// Tag for the package is the one read. An entry already carrying a tag keeps it: that is the tag its own specifier
// Installs from, which a rule cannot change, so the entry is read once and under the tag the lockfile resolved it from.
export const getFollowedTagEntries = (entries: DependencyEntry[], rules: RenovateRule[]): DependencyEntry[] => {
  const followedEntries: DependencyEntry[] = [];

  for (const entry of entries) {
    const followTag = entry.followTag ?? getLastSettingRule(rules, entry.packageName, "followTag")?.followTag;
    if (followTag !== undefined) followedEntries.push({ ...entry, followTag });
  }

  return followedEntries;
};
