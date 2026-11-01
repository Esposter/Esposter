import type { Comparator } from "#src/models/semver/Comparator";
import type { Version } from "#src/models/semver/Version";

import { checkIsComparatorSatisfied } from "#src/services/semver/checkIsComparatorSatisfied";
import { checkIsPrereleaseNamed } from "#src/services/semver/checkIsPrereleaseNamed";

export const checkIsComparatorSetSatisfied = (
  version: Version,
  set: Comparator[],
  includePrerelease: boolean,
): boolean => {
  if (!set.every((comparator) => checkIsComparatorSatisfied(version, comparator))) return false;

  return includePrerelease || version.prerelease.length === 0 || checkIsPrereleaseNamed(version, set);
};
