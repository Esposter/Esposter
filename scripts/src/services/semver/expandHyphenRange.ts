import type { ComparatorText } from "#src/models/semver/ComparatorText";
import type { ComparatorToken } from "#src/models/semver/ComparatorToken";

import { expandHyphenLowerBound } from "#src/services/semver/expandHyphenLowerBound";
import { expandHyphenUpperBound } from "#src/services/semver/expandHyphenUpperBound";

export const expandHyphenRange = (
  from: ComparatorToken,
  to: ComparatorToken,
  prereleaseSuffix: string,
): ComparatorText[] => [
  ...expandHyphenLowerBound(from, prereleaseSuffix),
  ...expandHyphenUpperBound(to, prereleaseSuffix),
];
