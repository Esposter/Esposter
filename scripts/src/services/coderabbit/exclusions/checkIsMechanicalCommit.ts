import { checkIsRelocatablePath } from "#src/services/coderabbit/exclusions/checkIsRelocatablePath";
import { readMechanicalPaths } from "#src/services/coderabbit/exclusions/readMechanicalPaths";

// Whether a commit has anything a reviewer could comment on. Every file in it must be a move that changed no
// Bytes, or a move whose only edit is its own imports following it, or a file that stayed put and repathed an
// Import of something that moved — and none of them may be a file whose location is itself a decision.
//
// The two halves guard different things and neither is redundant. The per-file diff proof is what rules out a
// Content change, so protection against content edits would restate it — what the path rule adds is the case the
// Diff cannot see: a file read by *where it is*, where moving it with no content change is still a decision, and
// It is asked of both ends of a move.
export const checkIsMechanicalCommit = (sha: string, cwd?: string): boolean => {
  const { mechanicalPaths, rows } = readMechanicalPaths([`${sha}^`, sha], cwd);
  // An empty commit has nothing to prove mechanical, and a merge has no single parent to diff against
  if (rows.length === 0) return false;

  return rows.every(
    ({ path, renamedFrom }) =>
      mechanicalPaths.has(path) &&
      checkIsRelocatablePath(path) &&
      (renamedFrom === undefined || checkIsRelocatablePath(renamedFrom)),
  );
};
