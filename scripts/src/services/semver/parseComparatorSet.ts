import type { Comparator } from "#src/models/semver/Comparator";
import type { ComparatorText } from "#src/models/semver/ComparatorText";

import { RangeOperator } from "#src/models/semver/RangeOperator";
import { ANY_COMPARATOR_TEXT } from "#src/services/semver/constants";
import { expandComparatorToken } from "#src/services/semver/expandComparatorToken";
import { expandHyphenRange } from "#src/services/semver/expandHyphenRange";
import { parseComparatorToken } from "#src/services/semver/parseComparatorToken";
import { parseVersion } from "#src/services/semver/parseVersion";

const HYPHEN_RANGE_REGEX = /^(?<from>\S+)\s+-\s+(?<to>\S+)$/u;
// An operator spaced from its version is read as one token with it
const SPACED_OPERATOR_REGEX = /(?<operator><=|>=|<|>|=|~>?|\^)\s+/gu;

const parseComparatorTexts = (set: string, includePrerelease: boolean): ComparatorText[] | undefined => {
  const hyphenGroups = HYPHEN_RANGE_REGEX.exec(set)?.groups;
  if (hyphenGroups) {
    const from = parseComparatorToken(hyphenGroups.from || "");
    const to = parseComparatorToken(hyphenGroups.to || "");
    return from && to && from.operator === RangeOperator.Equal && to.operator === RangeOperator.Equal
      ? expandHyphenRange(from, to, includePrerelease ? "-0" : "")
      : undefined;
  }

  const tokens = set.replace(SPACED_OPERATOR_REGEX, "$<operator>").split(/\s+/u).filter(Boolean);
  const texts: ComparatorText[] = [];
  for (const token of tokens) {
    const comparatorToken = parseComparatorToken(token);
    if (!comparatorToken) return undefined;

    texts.push(...expandComparatorToken(comparatorToken, includePrerelease));
  }

  return texts;
};

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
