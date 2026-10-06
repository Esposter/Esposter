import { parseVersionTag } from "#src/services/outdatedDependencies/tag/parseVersionTag";

// The newest of `tags` sharing the current tag's shape — its prefix, its suffix and its number of release parts — so
// `1.38.0-uclibc` is weighed against other `-uclibc` releases and never against `1.38` or a `3.5-dev8` prerelease.
// The current tag itself when nothing newer has its shape
export const getLatestCompatibleTag = (current: string, tags: string[]): string => {
  const currentTag = parseVersionTag(current);
  if (!currentTag) return current;

  let latest = { release: currentTag.release, tag: current };
  for (const tag of tags) {
    const versionTag = parseVersionTag(tag);
    if (
      !versionTag ||
      versionTag.prefix !== currentTag.prefix ||
      versionTag.suffix !== currentTag.suffix ||
      versionTag.release.length !== currentTag.release.length
    )
      continue;

    const difference = versionTag.release.map((part, index) => part - (latest.release[index] ?? 0)).find(Boolean) ?? 0;
    if (difference > 0) latest = { release: versionTag.release, tag };
  }
  return latest.tag;
};
