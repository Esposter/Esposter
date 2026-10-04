import type { RenovateRule } from "#src/models/outdatedDependencies/renovate/RenovateRule";
import type { DependencyEntry } from "#src/models/outdatedDependencies/shared/DependencyEntry";

// The catalog entries a `followTag` rule points at a dist-tag, each carrying that tag: Renovate proposes the
// Tag's version rather than `latest`, so the report asks the registry for the same thing. Rules merge in order
// With a later key overriding an earlier one, as in Renovate, so the last rule following a tag for the package
// Is the one read. An entry already carrying a tag keeps it: that is the tag its own specifier installs from, which
// A rule cannot change, so the entry is read once and under the tag the lockfile resolved it from.
export const getFollowedTagEntries = (entries: DependencyEntry[], rules: RenovateRule[]): DependencyEntry[] => {
  const followedEntries: DependencyEntry[] = [];

  for (const entry of entries) {
    const rule = rules.findLast(
      ({ followTag, matchPackageNames }) => followTag !== undefined && matchPackageNames.includes(entry.packageName),
    );
    const followTag = entry.followTag ?? rule?.followTag;
    if (followTag !== undefined) followedEntries.push({ ...entry, followTag });
  }

  return followedEntries;
};
