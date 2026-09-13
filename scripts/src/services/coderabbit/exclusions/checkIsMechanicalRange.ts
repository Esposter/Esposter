import { checkIsRelocatablePath } from "#src/services/coderabbit/exclusions/checkIsRelocatablePath";
import { readMechanicalPaths } from "#src/services/coderabbit/exclusions/readMechanicalPaths";

// Whether a range's diff has anything a reviewer could comment on. Every file in it must be a move that changed
// No bytes, or a move whose only edit is its own imports following it, or a file that stayed put and repathed an
// Import of something that moved — and none of them may be a file whose location is itself a decision.
//
// The two halves guard different things and neither is redundant. The per-file diff proof is what rules out a
// Content change, so protection against content edits would restate it — what the path rule adds is the case the
// Diff cannot see: a file read by *where it is*, where moving it with no content change is still a decision, and
// It is asked of both ends of a move.
//
// A range whose net diff is empty proves nothing mechanical, which is the safe answer: it is either a commit that
// Changed no files, a merge whose first parent already carries everything, or a pair of commits that undo each
// Other — and none of the three is an express lane's business.
export const checkIsMechanicalRange = (range: string[], cwd?: string): boolean => {
  const { mechanicalPaths, rows } = readMechanicalPaths(range, cwd);
  if (rows.length === 0) return false;

  return rows.every(
    ({ path, renamedFrom }) =>
      mechanicalPaths.has(path) &&
      checkIsRelocatablePath(path) &&
      (renamedFrom === undefined || checkIsRelocatablePath(renamedFrom)),
  );
};
