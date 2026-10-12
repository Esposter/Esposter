import type { ComparatorText } from "#src/models/semver/ComparatorText";

import { incrementNumericIdentifier } from "#src/services/semver/incrementNumericIdentifier";
import { toBounds } from "#src/services/semver/toBounds";

// A major with its minor and patch wildcarded spans every version of that major
export const expandMajorBounds = (major: string, prereleaseSuffix: string): ComparatorText[] =>
  toBounds(`${major}.0.0${prereleaseSuffix}`, `${incrementNumericIdentifier(major)}.0.0-0`);
