import { VersionChangeLevel } from "#src/models/outdatedDependencies/VersionChangeLevel";
import { getVersionParts } from "#src/services/getVersionParts";

export const getVersionChangeLevel = (current: string, latest: string): VersionChangeLevel => {
  const currentParts = getVersionParts(current);
  const latestParts = getVersionParts(latest);
  if (currentParts.major !== latestParts.major) return VersionChangeLevel.Major;
  if (currentParts.minor !== latestParts.minor) return VersionChangeLevel.Minor;
  return VersionChangeLevel.Patch;
};
