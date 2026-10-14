import type { ComparatorText } from "#src/models/semver/ComparatorText";
import type { ComparatorToken } from "#src/models/semver/ComparatorToken";

import { RangeOperator } from "#src/models/semver/RangeOperator";
import { checkIsAnyPart } from "#src/services/semver/checkIsAnyPart";
import { incrementNumericIdentifier } from "#src/services/semver/incrementNumericIdentifier";

// The first version is the lower bound, and a wildcard leaves that side open
const expandHyphenLowerBound = (token: ComparatorToken, prereleaseSuffix: string): ComparatorText[] => {
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

// The last version is the upper bound: a bare one includes itself, and with prereleases included it takes in its own
// Prereleases as well, so the bound stops at the next patch's lowest prerelease
const expandHyphenUpperBound = (token: ComparatorToken, prereleaseSuffix: string): ComparatorText[] => {
  const { major, minor, patch, prerelease } = token;
  if (checkIsAnyPart(major)) return [];
  if (checkIsAnyPart(minor))
    return [{ operator: RangeOperator.LessThan, version: `${incrementNumericIdentifier(major)}.0.0-0` }];
  if (checkIsAnyPart(patch))
    return [{ operator: RangeOperator.LessThan, version: `${major}.${incrementNumericIdentifier(minor)}.0-0` }];
  if (prerelease)
    return [{ operator: RangeOperator.LessThanOrEqual, version: `${major}.${minor}.${patch}${prerelease}` }];
  if (prereleaseSuffix)
    return [{ operator: RangeOperator.LessThan, version: `${major}.${minor}.${incrementNumericIdentifier(patch)}-0` }];

  return [{ operator: RangeOperator.LessThanOrEqual, version: `${major}.${minor}.${patch}` }];
};

export const expandHyphenRange = (
  from: ComparatorToken,
  to: ComparatorToken,
  prereleaseSuffix: string,
): ComparatorText[] => [
  ...expandHyphenLowerBound(from, prereleaseSuffix),
  ...expandHyphenUpperBound(to, prereleaseSuffix),
];
