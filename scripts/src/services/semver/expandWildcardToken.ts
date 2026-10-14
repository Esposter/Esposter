import type { ComparatorText } from "#src/models/semver/ComparatorText";
import type { ComparatorToken } from "#src/models/semver/ComparatorToken";

import { checkIsAnyPart } from "#src/services/semver/checkIsAnyPart";
import { ANY_COMPARATOR_TEXT } from "#src/services/semver/constants";
import { expandMajorBounds } from "#src/services/semver/expandMajorBounds";
import { toBounds } from "#src/services/semver/toBounds";

// A caret and a tilde share how a wildcard spans its versions: a wildcard major or minor spans what it names, and a
// Wildcard patch spans its minor, bounded above by the operator's own rule. Undefined means the token names all three
export const expandWildcardToken = (
  { major, minor, patch }: ComparatorToken,
  prereleaseSuffix: string,
  getPatchWildcardUpperBound: (major: string, minor: string) => string,
): ComparatorText[] | undefined => {
  if (checkIsAnyPart(major)) return [ANY_COMPARATOR_TEXT];
  if (checkIsAnyPart(minor)) return expandMajorBounds(major, prereleaseSuffix);
  if (checkIsAnyPart(patch))
    return toBounds(`${major}.${minor}.0${prereleaseSuffix}`, getPatchWildcardUpperBound(major, minor));

  return undefined;
};
