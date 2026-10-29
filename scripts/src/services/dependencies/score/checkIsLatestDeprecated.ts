import type { Packument } from "#src/models/dependencies/score/Packument";

// The latest release, the one a `latest` install gets, is deprecated: a flag on the row, never a score
export const checkIsLatestDeprecated = ({ "dist-tags": distTags, versions }: Packument): boolean => {
  const latestVersion = distTags.latest;
  return latestVersion !== undefined && Boolean(versions[latestVersion]?.deprecated);
};
