import type { ColorPalette } from "@/checkDependencies/models/ColorPalette";

import { getVersionChangeLevel } from "@/checkDependencies/getVersionChangeLevel";
import { getVersionParts } from "@/services/getVersionParts";

export const getColorizedLatestVersion = (current: string, latest: string, color: ColorPalette): string => {
  const changeLevel = getVersionChangeLevel(current, latest);
  const latestParts = getVersionParts(latest);

  if (changeLevel === 2) return color.red(latest);
  if (changeLevel === 1) return `${latestParts.major}${color.yellow(latest.slice(String(latestParts.major).length))}`;

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
