import type { RangeOptions } from "#src/models/semver/RangeOptions";

import { checkIsComparatorSetSatisfied } from "#src/services/semver/checkIsComparatorSetSatisfied";
import { parseRange } from "#src/services/semver/parseRange";
import { parseVersion } from "#src/services/semver/parseVersion";

// False for an unparseable version or range, rather than an error, so a bad allowed range holds nothing
export const checkIsVersionInRange = (version: string, range: string, { includePrerelease }: RangeOptions): boolean => {
  const parsedVersion = parseVersion(version);
  const sets = parseRange(range, includePrerelease);
  if (!parsedVersion || !sets) return false;

  return sets.some((set) => checkIsComparatorSetSatisfied(parsedVersion, set, includePrerelease));
};
