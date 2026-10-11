import type { Version } from "#src/models/semver/Version";

// SemVer 2.0.0 with the leading `v` node-semver accepts, and the build metadata read past and never compared
const VERSION_REGEX =
  /^v?(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-(?<prerelease>[\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?(?:\+[\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*)?$/u;
// A numeric prerelease identifier never has a leading zero
const LEADING_ZERO_NUMERIC_REGEX = /^0\d+$/u;

export const parseVersion = (version: string): undefined | Version => {
  const groups = VERSION_REGEX.exec(version.trim())?.groups;
  const prerelease = groups?.prerelease?.split(".") ?? [];
  if (
    !groups?.major ||
    !groups.minor ||
    !groups.patch ||
    prerelease.some((identifier) => LEADING_ZERO_NUMERIC_REGEX.test(identifier))
  )
    return undefined;

  return { major: groups.major, minor: groups.minor, patch: groups.patch, prerelease };
};
