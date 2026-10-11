import type { ComparatorText } from "#src/models/semver/ComparatorText";
import type { ComparatorToken } from "#src/models/semver/ComparatorToken";

import { RangeOperator } from "#src/models/semver/RangeOperator";
import { expandCaretToken } from "#src/services/semver/expandCaretToken";
import { expandTildeToken } from "#src/services/semver/expandTildeToken";
import { expandXRangeToken } from "#src/services/semver/expandXRangeToken";

// With prereleases included, a wildcard's lower bound reaches the prereleases of its own version, `-0` being the lowest
export const expandComparatorToken = (token: ComparatorToken, includePrerelease: boolean): ComparatorText[] => {
  const prereleaseSuffix = includePrerelease ? "-0" : "";

  switch (token.operator) {
    case RangeOperator.Caret:
      return expandCaretToken(token, prereleaseSuffix);
    case RangeOperator.Tilde:
      return expandTildeToken(token, prereleaseSuffix);
    default:
      return expandXRangeToken(token, prereleaseSuffix);
  }
};
