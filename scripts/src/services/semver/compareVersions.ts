import type { Version } from "#src/models/semver/Version";

import { compareNumericIdentifiers } from "#src/services/semver/compareNumericIdentifiers";
import { comparePrerelease } from "#src/services/semver/comparePrerelease";

export const compareVersions = (first: Version, second: Version): number =>
  compareNumericIdentifiers(first.major, second.major) ||
  compareNumericIdentifiers(first.minor, second.minor) ||
  compareNumericIdentifiers(first.patch, second.patch) ||
  comparePrerelease(first.prerelease, second.prerelease);
