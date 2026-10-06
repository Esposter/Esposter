import type { VersionParts } from "#src/models/shared/VersionParts";

// A tag's leading `v` (`v1.13.7`) is no part of the version it names
export const getVersionParts = (version: string): VersionParts => {
  const [versionBase = "", prerelease = ""] = version.replace(/^v/u, "").split("-", 2);
  const [major = 0, minor = 0, patch = 0] = versionBase.split(".").map((part) => Math.trunc(Number(part)) || 0);
  return { major, minor, patch, prerelease };
};
