import type { Comparator } from "#src/models/semver/Comparator";

import { ANY_COMPARATOR_TEXT } from "#src/services/semver/constants";
import { parseComparatorTexts } from "#src/services/semver/parseComparatorTexts";
import { parseVersion } from "#src/services/semver/parseVersion";

// A set is the comparators that must all hold together, and an empty one is every version
export const parseComparatorSet = (set: string, includePrerelease: boolean): Comparator[] | undefined => {
  const texts = parseComparatorTexts(set.trim(), includePrerelease);
  if (!texts) return undefined;

  const comparators: Comparator[] = [];
  for (const { operator, version } of texts.length > 0 ? texts : [ANY_COMPARATOR_TEXT]) {
    const parsedVersion = parseVersion(version);
    if (!parsedVersion) return undefined;

    comparators.push({ operator, version: parsedVersion });
  }

  return comparators;
};
