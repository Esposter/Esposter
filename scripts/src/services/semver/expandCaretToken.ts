import type { ComparatorText } from "#src/models/semver/ComparatorText";
import type { ComparatorToken } from "#src/models/semver/ComparatorToken";

import { expandWildcardToken } from "#src/services/semver/expandWildcardToken";
import { incrementNumericIdentifier } from "#src/services/semver/incrementNumericIdentifier";
import { toBounds } from "#src/services/semver/toBounds";

// A caret keeps everything from its first non-zero part on: `^1.2.3` is up to but excluding 2.0.0, and `^0.2.3` up
// To but excluding 0.3.0
export const expandCaretToken = (token: ComparatorToken, prereleaseSuffix: string): ComparatorText[] => {
  const wildcardText = expandWildcardToken(token, prereleaseSuffix, (wildcardMajor, wildcardMinor) =>
    wildcardMajor === "0"
      ? `0.${incrementNumericIdentifier(wildcardMinor)}.0-0`
      : `${incrementNumericIdentifier(wildcardMajor)}.0.0-0`,
  );
  if (wildcardText) return wildcardText;

  const { major, minor, patch, prerelease } = token;
  const lowerVersion = `${major}.${minor}.${patch}${prerelease}`;
  if (major !== "0") return toBounds(lowerVersion, `${incrementNumericIdentifier(major)}.0.0-0`);
  else if (minor === "0") return toBounds(lowerVersion, `0.0.${incrementNumericIdentifier(patch)}-0`);
  else return toBounds(lowerVersion, `0.${incrementNumericIdentifier(minor)}.0-0`);
};
