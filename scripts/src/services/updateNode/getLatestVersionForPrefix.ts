import { compareVersionBase } from "#src/services/compareVersionBase";
import { getVersionParts } from "#src/services/getVersionParts";
import { InvalidOperationError, Operation } from "@esposter/shared";
/** Highest stable version in `versions` whose `major.minor.patch` matches every segment of `prefix` (e.g. `26`, `26.4`). */
export const getLatestVersionForPrefix = (versions: string[], prefix: string): string => {
  const segments = prefix.split(".").map(Number);
  const matching = versions
    .filter((version) => {
      const { major, minor, patch, prerelease } = getVersionParts(version);
      if (prerelease) return false;
      const base = [major, minor, patch];
      return segments.every((segment, index) => base[index] === segment);
    })
    .toSorted(compareVersionBase);
  const latest = matching.at(-1);
  if (!latest)
    throw new InvalidOperationError(
      Operation.Read,
      getLatestVersionForPrefix.name,
      `No published version found for prefix ${prefix}`,
    );

  return latest;
};
