import type { RenovateRule } from "#src/models/outdatedDependencies/renovate/RenovateRule";
import type { OutdatedDependency } from "#src/models/outdatedDependencies/shared/OutdatedDependency";

import { checkIsVersionOutdated } from "#src/services/outdatedDependencies/registry/checkIsVersionOutdated";
import { checkIsVersionInRange } from "#src/services/semver/checkIsVersionInRange";
import { parseVersion } from "#src/services/semver/parseVersion";

// The newest stable version inside both the catalog specifier and the holding rule's `allowedVersions`, when it is newer
// Than `current`. A prerelease is never picked, though a range admits one.
export const getWithinRangeBump = (
  dependency: OutdatedDependency,
  specifier: string,
  rule: RenovateRule,
  versions: string[],
): OutdatedDependency | undefined => {
  const { allowedVersions } = rule;
  // A disabled package has no line to bump within, and a rule with no cap bounds none
  if (rule.enabled === false || allowedVersions === undefined) return undefined;

  const newestVersion = versions
    .filter(
      (version) =>
        parseVersion(version)?.prerelease.length === 0 &&
        checkIsVersionInRange(version, specifier, { includePrerelease: true }) &&
        checkIsVersionInRange(version, allowedVersions, { includePrerelease: true }),
    )
    .reduce<string | undefined>(
      (newest, version) => (newest === undefined || checkIsVersionOutdated(newest, version) ? version : newest),
      undefined,
    );

  return newestVersion !== undefined && checkIsVersionOutdated(dependency.current, newestVersion)
    ? { ...dependency, latest: newestVersion }
    : undefined;
};
