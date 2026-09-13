import type { VersionParts } from "#src/models/shared/VersionParts";

export const getVersionParts = (version: string): VersionParts => {
  const [versionBase = "", prerelease = ""] = version.split("-", 2);
  const [major = 0, minor = 0, patch = 0] = versionBase.split(".").map((part) => Math.trunc(Number(part)) || 0);
  return { major, minor, patch, prerelease };
};
