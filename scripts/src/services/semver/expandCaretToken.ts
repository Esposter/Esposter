import type { ComparatorText } from "#src/models/semver/ComparatorText";
import type { ComparatorToken } from "#src/models/semver/ComparatorToken";

import { checkIsAnyPart } from "#src/services/semver/checkIsAnyPart";
import { ANY_COMPARATOR_TEXT } from "#src/services/semver/constants";
import { incrementNumericIdentifier } from "#src/services/semver/incrementNumericIdentifier";
import { toBounds } from "#src/services/semver/toBounds";

// A caret keeps everything from its first non-zero part on: `^1.2.3` is up to but excluding 2.0.0, and `^0.2.3` up
// To but excluding 0.3.0
export const expandCaretToken = (
  { major, minor, patch, prerelease }: ComparatorToken,
  prereleaseSuffix: string,
): ComparatorText[] => {
  if (checkIsAnyPart(major)) return [ANY_COMPARATOR_TEXT];

  if (checkIsAnyPart(minor))
    return toBounds(`${major}.0.0${prereleaseSuffix}`, `${incrementNumericIdentifier(major)}.0.0-0`);

  if (checkIsAnyPart(patch))
    return toBounds(
      `${major}.${minor}.0${prereleaseSuffix}`,
      major === "0" ? `0.${incrementNumericIdentifier(minor)}.0-0` : `${incrementNumericIdentifier(major)}.0.0-0`,
    );

  const lowerVersion = `${major}.${minor}.${patch}${prerelease}`;
  if (major !== "0") return toBounds(lowerVersion, `${incrementNumericIdentifier(major)}.0.0-0`);
  else if (minor === "0") return toBounds(lowerVersion, `0.0.${incrementNumericIdentifier(patch)}-0`);
  else return toBounds(lowerVersion, `0.${incrementNumericIdentifier(minor)}.0-0`);
};
