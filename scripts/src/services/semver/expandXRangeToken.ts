import type { ComparatorText } from "#src/models/semver/ComparatorText";
import type { ComparatorToken } from "#src/models/semver/ComparatorToken";

import { RangeOperator } from "#src/models/semver/RangeOperator";
import { checkIsAnyPart } from "#src/services/semver/checkIsAnyPart";
import { ANY_COMPARATOR_TEXT } from "#src/services/semver/constants";
import { expandTildeToken } from "#src/services/semver/expandTildeToken";
import { incrementNumericIdentifier } from "#src/services/semver/incrementNumericIdentifier";

// A version with no wildcard is itself, a bare version with a wildcard is the bounds it spans, and an operator over a
// Wildcard moves its bound to the next version it names
export const expandXRangeToken = (
  { major, minor, operator, patch, prerelease }: ComparatorToken,
  prereleaseSuffix: string,
): ComparatorText[] => {
  if (checkIsAnyPart(major))
    return operator === RangeOperator.GreaterThan || operator === RangeOperator.LessThan
      ? [{ operator: RangeOperator.LessThan, version: "0.0.0-0" }]
      : [ANY_COMPARATOR_TEXT];

  const isAnyMinor = checkIsAnyPart(minor);
  const isAnyPatch = isAnyMinor || checkIsAnyPart(patch);
  if (!isAnyPatch) return [{ operator, version: `${major}.${minor}.${patch}${prerelease}` }];

  // A wildcard names the versions its tilde names, so an equal over one takes the tilde's bounds
  if (operator === RangeOperator.Equal)
    return expandTildeToken({ major, minor, operator, patch, prerelease }, prereleaseSuffix);

  if (operator === RangeOperator.GreaterThan)
    return [
      {
        operator: RangeOperator.GreaterThanOrEqual,
        version: isAnyMinor
          ? `${incrementNumericIdentifier(major)}.0.0${prereleaseSuffix}`
          : `${major}.${incrementNumericIdentifier(minor)}.0${prereleaseSuffix}`,
      },
    ];

  if (operator === RangeOperator.LessThanOrEqual)
    return [
      {
        operator: RangeOperator.LessThan,
        version: isAnyMinor
          ? `${incrementNumericIdentifier(major)}.0.0-0`
          : `${major}.${incrementNumericIdentifier(minor)}.0-0`,
      },
    ];

  const lowerVersion = isAnyMinor ? `${major}.0.0` : `${major}.${minor}.0`;
  return [
    {
      operator,
      version: operator === RangeOperator.LessThan ? `${lowerVersion}-0` : `${lowerVersion}${prereleaseSuffix}`,
    },
  ];
};
