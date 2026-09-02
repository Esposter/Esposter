import { comparePrerelease } from "#scripts/outdatedDependencies/comparePrerelease";
import { compareVersionBase } from "#scripts/services/compareVersionBase";
import { getVersionParts } from "#scripts/services/getVersionParts";

export const isVersionOutdated = (current: string, latest: string): boolean => {
  const baseComparison = compareVersionBase(current, latest);
  if (baseComparison > 0) return false;
  if (baseComparison < 0) return true;

  return comparePrerelease(getVersionParts(current).prerelease, getVersionParts(latest).prerelease) < 0;
};
