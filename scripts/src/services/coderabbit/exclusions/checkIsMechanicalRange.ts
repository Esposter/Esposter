import { checkIsRelocatablePath } from "#src/services/coderabbit/exclusions/checkIsRelocatablePath";
import { readMechanicalPaths } from "#src/services/coderabbit/exclusions/readMechanicalPaths";

// Whether a range's diff has anything a reviewer could comment on: every file a move that changed no bytes, or
// Whose only edit is imports following a move, and none of them a file whose location is itself a decision —
// The case the diff cannot see, asked of both ends of a move. An empty net diff proves nothing: a commit that
// Changed no files, a merge already carried, or two commits that undo each other.
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
