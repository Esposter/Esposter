import { compareVersionBase } from "@/services/compareVersionBase";
import { getVersionParts } from "@/services/getVersionParts";
/** Highest stable version in `versions` whose `major.minor.patch` matches every segment of `prefix` (e.g. `26`, `26.4`). */
export const getLatestVersionForPrefix = (versions: string[], prefix: string): string => {
  const segments = prefix.split(".").map(Number);
  const matching = versions
    .filter((version) => {
      const { major, minor, patch, prerelease } = getVersionParts(version);
      if (prerelease !== undefined) return false;
      const base = [major, minor, patch];
      return segments.every((segment, index) => base[index] === segment);
    })
    .toSorted(compareVersionBase);
  const latest = matching.at(-1);
  if (!latest) throw new Error(`No published version found for prefix ${prefix}`);

  return latest;
};
