import type { LeafIssue } from "#src/models/LeafIssue";
import type { z } from "zod";

import { getDeepestPathLength } from "#src/services/getDeepestPathLength";

// A union reports each branch's issues.
// The branch the author meant is the one that matched furthest into the input.
// Zod's own pretty-printing stops at the union, so the walk goes through every branch and keeps the deepest one.
export const getLeafIssues = (issue: z.core.$ZodIssue, parentPath: PropertyKey[]): LeafIssue[] => {
  const path = [...parentPath, ...issue.path];
  if (issue.code !== "invalid_union") return [{ issue, path }];

  const branches = issue.errors.map((branch) => branch.flatMap((branchIssue) => getLeafIssues(branchIssue, path)));
  return branches.reduce((deepest, branch) =>
    getDeepestPathLength(branch) > getDeepestPathLength(deepest) ? branch : deepest,
  );
};
