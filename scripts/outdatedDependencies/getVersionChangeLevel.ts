import { VersionChangeLevel } from "#scripts/outdatedDependencies/constants";
import { getVersionParts } from "#scripts/services/getVersionParts";

export const getVersionChangeLevel = (current: string, latest: string): VersionChangeLevel => {
  const currentParts = getVersionParts(current);
  const latestParts = getVersionParts(latest);
  if (currentParts.major !== latestParts.major) return VersionChangeLevel.major;
  if (currentParts.minor !== latestParts.minor) return VersionChangeLevel.minor;
  return VersionChangeLevel.patch;
};
