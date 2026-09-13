import { checkIsImportPathOnlyDiff } from "#src/services/coderabbit/exclusions/checkIsImportPathOnlyDiff";
import { checkIsRelocatablePath } from "#src/services/coderabbit/exclusions/checkIsRelocatablePath";
import { getPureRenamePaths } from "#src/services/coderabbit/exclusions/getPureRenamePaths";
import { getRenamedFromPaths } from "#src/services/coderabbit/exclusions/getRenamedFromPaths";
import { getRenamePathspec } from "#src/services/coderabbit/exclusions/getRenamePathspec";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";

// Whether a commit has anything a reviewer could comment on. Every file in it must be a move that changed no
// Bytes, or a move whose only edit is its own imports following it, or a file that stayed put and repathed an
// Import — which together are what a folder sweep is and nothing else is. One file failing sinks the commit,
// Because a window is cut at commit boundaries and half a commit cannot skip a review.
//
// The two halves guard different things and neither is redundant. The per-file diff proof is what rules out a
// Content change, so protection against content edits would restate it — what the path rule adds is the case the
// Diff cannot see: a file read by *where it is*, where moving it with no content change is still a decision.
export const checkIsMechanicalCommit = (sha: string, cwd?: string): boolean => {
  const range = [`${sha}^`, sha];
  const nameStatus = runGit(["diff", "--name-status", "-M", ...range], cwd);
  const changedPaths = getNonEmptyLines(runGit(["diff", "--name-only", "-M", ...range], cwd));
  // An empty commit has nothing to prove mechanical, and a merge has no single parent to diff against
  if (changedPaths.length === 0) return false;

  const renamedFromPaths = getRenamedFromPaths(nameStatus);
  const pureRenamePaths = new Set(getPureRenamePaths(nameStatus));
  return changedPaths.every((path) => {
    const pathspec = getRenamePathspec(path, renamedFromPaths);
    if (!pathspec.every((changedPath) => checkIsRelocatablePath(changedPath))) return false;
    if (pureRenamePaths.has(path)) return true;
    return checkIsImportPathOnlyDiff(runGit(["diff", "-U0", "-M", ...range, "--", ...pathspec], cwd));
  });
};
