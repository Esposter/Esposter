import { VersionChangeLevel } from "#src/models/outdatedDependencies/shared/VersionChangeLevel";
import { getVersionParts } from "#src/services/shared/getVersionParts";

export const getVersionChangeLevel = (current: string, latest: string): VersionChangeLevel => {
  const currentParts = getVersionParts(current);
  const latestParts = getVersionParts(latest);
  if (currentParts.major !== latestParts.major) return VersionChangeLevel.Major;
  else if (currentParts.minor === latestParts.minor) return VersionChangeLevel.Patch;
  else return VersionChangeLevel.Minor;
};
