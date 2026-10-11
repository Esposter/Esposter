import type { Comparator } from "#src/models/semver/Comparator";

import { parseComparatorSet } from "#src/services/semver/parseComparatorSet";

// A range is the `||` alternatives of its sets, and undefined when any part is not a range
export const parseRange = (range: string, includePrerelease: boolean): Comparator[][] | undefined => {
  const sets: Comparator[][] = [];
  for (const set of range.split("||")) {
    const comparators = parseComparatorSet(set, includePrerelease);
    if (!comparators) return undefined;

    sets.push(comparators);
  }

  return sets;
};
