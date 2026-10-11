import type { ResumeItem } from "#src/models/resume/ResumeItem";

import { TREE_ACTION, TREE_GROUP_SEGMENT_COUNT } from "#src/services/resume/constants";

const LOCKFILE_PATH = "pnpm-lock.yaml";
const MANIFEST_REGEX = /(?:^|\/)(?:package\.json|pnpm-workspace\.yaml)$/u;

// The pending paths of `git status --porcelain`, counted by their first two path segments. A rename counts under its
// New path
export const groupTreePaths = (porcelainLines: readonly string[]): ResumeItem[] => {
  const paths = porcelainLines.map((line) => line.slice(3).split(" -> ").at(-1) ?? "");
  // Lockfile drift with no manifest is autoDedupe and verifyDepsBeforeRun re-resolving nightly ranges, never committed.
  const isLockfileDrift = !paths.some((path) => MANIFEST_REGEX.test(path));
  const countMap = new Map<string, number>();
  for (const path of paths) {
    if (isLockfileDrift && path === LOCKFILE_PATH) continue;
    const group = path.split("/").slice(0, TREE_GROUP_SEGMENT_COUNT).join("/");
    countMap.set(group, (countMap.get(group) ?? 0) + 1);
  }
  return Array.from(countMap, ([group, count]) => ({ action: TREE_ACTION, text: `${group} (${count})` }));
};
