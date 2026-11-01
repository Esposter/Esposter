import type { Comparator } from "#src/models/semver/Comparator";
import type { Version } from "#src/models/semver/Version";

// A prerelease satisfies a set only where the set names a prerelease of the same major, minor and patch
export const checkIsPrereleaseNamed = (version: Version, set: Comparator[]): boolean =>
  set.some(
    ({ version: bound }) =>
      bound.prerelease.length > 0 &&
      bound.major === version.major &&
      bound.minor === version.minor &&
      bound.patch === version.patch,
  );
