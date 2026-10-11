import type { Comparator } from "#src/models/semver/Comparator";
import type { Version } from "#src/models/semver/Version";

import { RangeOperator } from "#src/models/semver/RangeOperator";
import { compareVersions } from "#src/services/semver/compareVersions";

const checkIsComparatorSatisfied = (version: Version, { operator, version: bound }: Comparator): boolean => {
  const comparison = compareVersions(version, bound);
  switch (operator) {
    case RangeOperator.Equal:
      return comparison === 0;
    case RangeOperator.GreaterThan:
      return comparison > 0;
    case RangeOperator.GreaterThanOrEqual:
      return comparison >= 0;
    case RangeOperator.LessThan:
      return comparison < 0;
    case RangeOperator.LessThanOrEqual:
      return comparison <= 0;
    default:
      // Caret and tilde are expanded into bounds before a comparator exists, so never reach here
      return false;
  }
};

// A prerelease satisfies a set only where the set names a prerelease of the same major, minor and patch
const checkIsPrereleaseNamed = (version: Version, set: Comparator[]): boolean =>
  set.some(
    ({ version: bound }) =>
      bound.prerelease.length > 0 &&
      bound.major === version.major &&
      bound.minor === version.minor &&
      bound.patch === version.patch,
  );

export const checkIsComparatorSetSatisfied = (
  version: Version,
  set: Comparator[],
  includePrerelease: boolean,
): boolean => {
  if (!set.every((comparator) => checkIsComparatorSatisfied(version, comparator))) return false;

  return includePrerelease || version.prerelease.length === 0 || checkIsPrereleaseNamed(version, set);
};
