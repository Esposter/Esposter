import type { ComparatorText } from "#src/models/semver/ComparatorText";
import type { ComparatorToken } from "#src/models/semver/ComparatorToken";

import { RangeOperator } from "#src/models/semver/RangeOperator";
import { checkIsAnyPart } from "#src/services/semver/checkIsAnyPart";

// The first version is the lower bound, and a wildcard leaves that side open
export const expandHyphenLowerBound = (token: ComparatorToken, prereleaseSuffix: string): ComparatorText[] => {
  const { major, minor, patch, prerelease } = token;
  if (checkIsAnyPart(major)) return [];
  if (checkIsAnyPart(minor))
    return [{ operator: RangeOperator.GreaterThanOrEqual, version: `${major}.0.0${prereleaseSuffix}` }];
  if (checkIsAnyPart(patch))
    return [{ operator: RangeOperator.GreaterThanOrEqual, version: `${major}.${minor}.0${prereleaseSuffix}` }];

  return [
    {
      operator: RangeOperator.GreaterThanOrEqual,
      version: `${major}.${minor}.${patch}${prerelease || prereleaseSuffix}`,
    },
  ];
};
