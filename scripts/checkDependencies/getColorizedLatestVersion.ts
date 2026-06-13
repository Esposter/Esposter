import type { ColorPalette } from "@/checkDependencies/models/ColorPalette";

import { getVersionChangeLevel } from "@/checkDependencies/getVersionChangeLevel";
import { getVersionParts } from "@/checkDependencies/getVersionParts";

export const getColorizedLatestVersion = (current: string, latest: string, color: ColorPalette): string => {
  const changeLevel = getVersionChangeLevel(current, latest);
  const latestParts = getVersionParts(latest);

  if (changeLevel === 2) return color.red(latest);
  if (changeLevel === 1) return `${latestParts.major}${color.yellow(latest.slice(String(latestParts.major).length))}`;

  const currentParts = getVersionParts(current);

  // Same base version but the latest is a prerelease (e.g. a nightly `7.0.0-dev.20260613.1`):
  // Keep the semver base and prerelease label (`7.0.0-dev.`) plain and highlight only the changed
  // Build/date tail (`20260613.1`) in red, starting from the first digit of the prerelease.
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
