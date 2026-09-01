import type { ColorPalette } from "#scripts/checkDependencies/models/ColorPalette";

import { VersionChangeLevel } from "#scripts/checkDependencies/constants";
import { getVersionChangeLevel } from "#scripts/checkDependencies/getVersionChangeLevel";
import { getVersionParts } from "#scripts/services/getVersionParts";

export const getColorizedLatestVersion = (current: string, latest: string, color: ColorPalette): string => {
  const changeLevel = getVersionChangeLevel(current, latest);
  const latestParts = getVersionParts(latest);

  if (changeLevel === VersionChangeLevel.major) return color.red(latest);
  if (changeLevel === VersionChangeLevel.minor)
    return `${latestParts.major}${color.yellow(latest.slice(String(latestParts.major).length))}`;

  const currentParts = getVersionParts(current);
  // For a prerelease bump on the same base, highlight only the changed build tail (from its first digit) in red.
  if (
    currentParts.patch === latestParts.patch &&
    latestParts.prerelease &&
    currentParts.prerelease !== latestParts.prerelease
  ) {
    const prereleaseStart = latest.indexOf("-") + 1;
    const prereleaseDigitOffset = latest.slice(prereleaseStart).search(/\d/u);
    const tailStart = prereleaseDigitOffset === -1 ? prereleaseStart : prereleaseStart + prereleaseDigitOffset;
    return `${latest.slice(0, tailStart)}${color.red(latest.slice(tailStart))}`;
  }

  if (currentParts.patch !== latestParts.patch || currentParts.prerelease !== latestParts.prerelease) {
    const prefix = `${latestParts.major}.${latestParts.minor}.`;
    return `${prefix}${color.green(latest.slice(prefix.length))}`;
  }

  return latest;
};
