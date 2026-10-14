import type { ComparatorText } from "#src/models/semver/ComparatorText";
import type { ComparatorToken } from "#src/models/semver/ComparatorToken";

import { expandWildcardToken } from "#src/services/semver/expandWildcardToken";
import { incrementNumericIdentifier } from "#src/services/semver/incrementNumericIdentifier";
import { toBounds } from "#src/services/semver/toBounds";

// A tilde keeps the minor version: `~1.2.3` is up to but excluding 1.3.0, and `~1` is up to but excluding 2.0.0
export const expandTildeToken = (token: ComparatorToken, prereleaseSuffix: string): ComparatorText[] => {
  const wildcardText = expandWildcardToken(
    token,
    prereleaseSuffix,
    (wildcardMajor, wildcardMinor) => `${wildcardMajor}.${incrementNumericIdentifier(wildcardMinor)}.0-0`,
  );
  if (wildcardText) return wildcardText;

  const { major, minor, patch, prerelease } = token;

  return toBounds(`${major}.${minor}.${patch}${prerelease}`, `${major}.${incrementNumericIdentifier(minor)}.0-0`);
};
