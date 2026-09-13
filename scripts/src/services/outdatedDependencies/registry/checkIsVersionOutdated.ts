import { comparePrerelease } from "#src/services/outdatedDependencies/registry/comparePrerelease";
import { compareVersionBase } from "#src/services/shared/compareVersionBase";
import { getVersionParts } from "#src/services/shared/getVersionParts";

export const checkIsVersionOutdated = (current: string, latest: string): boolean => {
  const baseComparison = compareVersionBase(current, latest);
  if (baseComparison > 0) return false;
  if (baseComparison < 0) return true;

  return comparePrerelease(getVersionParts(current).prerelease, getVersionParts(latest).prerelease) < 0;
};
