import type { LeafIssue } from "#src/models/LeafIssue";

export const getDeepestPathLength = (leafIssues: LeafIssue[]): number =>
  Math.max(-1, ...leafIssues.map(({ path }) => path.length));
