import type { ComparatorText } from "#src/models/semver/ComparatorText";
import type { ComparatorToken } from "#src/models/semver/ComparatorToken";

import { checkIsAnyPart } from "#src/services/semver/checkIsAnyPart";
import { ANY_COMPARATOR_TEXT } from "#src/services/semver/constants";
import { expandMajorBounds } from "#src/services/semver/expandMajorBounds";
import { incrementNumericIdentifier } from "#src/services/semver/incrementNumericIdentifier";
import { toBounds } from "#src/services/semver/toBounds";

// A tilde keeps the minor version: `~1.2.3` is up to but excluding 1.3.0, and `~1` is up to but excluding 2.0.0
export const expandTildeToken = (
  { major, minor, patch, prerelease }: ComparatorToken,
  prereleaseSuffix: string,
): ComparatorText[] => {
  if (checkIsAnyPart(major)) return [ANY_COMPARATOR_TEXT];

  if (checkIsAnyPart(minor)) return expandMajorBounds(major, prereleaseSuffix);

  if (checkIsAnyPart(patch))
    return toBounds(`${major}.${minor}.0${prereleaseSuffix}`, `${major}.${incrementNumericIdentifier(minor)}.0-0`);

  return toBounds(`${major}.${minor}.${patch}${prerelease}`, `${major}.${incrementNumericIdentifier(minor)}.0-0`);
};
