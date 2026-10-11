import type { z } from "zod";

interface LeafIssue {
  issue: z.core.$ZodIssue;
  path: PropertyKey[];
}

const getDeepestPathLength = (leafIssues: LeafIssue[]): number =>
  Math.max(-1, ...leafIssues.map(({ path }) => path.length));

// A union reports each branch's issues, and the branch that matched furthest into the input is the one the author meant.
// Zod's own pretty-printing stops at the union, so the walk goes through every branch and keeps the deepest one
const getLeafIssues = (issue: z.core.$ZodIssue, parentPath: PropertyKey[]): LeafIssue[] => {
  const path = [...parentPath, ...issue.path];
  if (issue.code !== "invalid_union") return [{ issue, path }];

  const branches = issue.errors.map((branch) => branch.flatMap((branchIssue) => getLeafIssues(branchIssue, path)));
  return branches.reduce((deepest, branch) =>
    getDeepestPathLength(branch) > getDeepestPathLength(deepest) ? branch : deepest,
  );
};

const formatLeafIssue = ({ issue, path }: LeafIssue): string => {
  const dottedPath = path.map(String).join(".");
  return `${dottedPath || "(options)"}: ${issue.message}`;
};

export const formatZodIssues = (issues: z.core.$ZodIssue[]): string =>
  issues
    .flatMap((issue) => getLeafIssues(issue, []))
    .map((leafIssue) => formatLeafIssue(leafIssue))
    .join("; ");
