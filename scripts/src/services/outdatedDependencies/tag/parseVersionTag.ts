import type { VersionTag } from "#src/models/outdatedDependencies/tag/VersionTag";

const VERSION_TAG_REGEX = /^(?<prefix>\D*)(?<release>\d+(?:\.\d+)*)(?<suffix>-.+)?$/u;

// Undefined for a tag that names no version — a codename, `latest` — which the publisher can repoint at anything
export const parseVersionTag = (tag: string): undefined | VersionTag => {
  const groups = VERSION_TAG_REGEX.exec(tag)?.groups;
  return groups?.release === undefined
    ? undefined
    : { prefix: groups.prefix ?? "", release: groups.release.split(".").map(Number), suffix: groups.suffix ?? "" };
};
