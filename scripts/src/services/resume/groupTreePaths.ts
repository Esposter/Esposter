import type { ResumeItem } from "#src/models/resume/ResumeItem";

import { TREE_ACTION, TREE_GROUP_SEGMENT_COUNT } from "#src/services/resume/constants";

// The pending paths of `git status --porcelain`, counted by their first two path segments. A rename counts under its
// New path
export const groupTreePaths = (porcelainLines: readonly string[]): ResumeItem[] => {
  const countMap = new Map<string, number>();
  for (const line of porcelainLines) {
    const path = line.slice(3).split(" -> ").at(-1) ?? "";
    const group = path.split("/").slice(0, TREE_GROUP_SEGMENT_COUNT).join("/");
    countMap.set(group, (countMap.get(group) ?? 0) + 1);
  }
  return Array.from(countMap, ([group, count]) => ({ action: TREE_ACTION, text: `${group} (${count})` }));
};
