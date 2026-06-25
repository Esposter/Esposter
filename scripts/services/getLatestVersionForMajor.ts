import { compareVersionBase } from "@/services/compareVersionBase";
import { getVersionParts } from "@/services/getVersionParts";
/** Highest version in `versions` whose major equals `major` (stable releases only). */
export const getLatestVersionForMajor = (versions: string[], major: number): string => {
  const matching = versions
    .filter((version) => {
      const { major: versionMajor, prerelease } = getVersionParts(version);
      return versionMajor === major && prerelease === undefined;
    })
    .toSorted(compareVersionBase);
  const latest = matching.at(-1);
  if (!latest) throw new Error(`No published version found for major ${major}`);

  return latest;
};
