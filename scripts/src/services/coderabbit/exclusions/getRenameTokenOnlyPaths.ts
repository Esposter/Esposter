import type { RenameSubstitution } from "#src/models/coderabbit/shared/RenameSubstitution";

import { checkIsProtectedPath } from "#src/services/coderabbit/exclusions/checkIsProtectedPath";
import { checkIsSubstitutionExact } from "#src/services/coderabbit/exclusions/checkIsSubstitutionExact";
import { RENAME_OR_MODIFY_ROW_REGEX } from "#src/services/coderabbit/exclusions/constants";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The sweep's own commit is the one whose substitutions are replayed, and it must be one of the range's: a sha
// Outside it would let paths the range never changed into a static filter that then swallows a later real change
// To them. A file any sibling commit in the range also touched carries a content change under either of its paths,
// So it stays in — and so does a rename out of a protected tree, which is still a change to that tree.
export const getRenameTokenOnlyPaths = (
  range: string,
  changedPaths: ReadonlySet<string>,
  renameSha: string,
  substitutions: RenameSubstitution[],
): string[] => {
  const sha = runGit(["rev-parse", "--verify", `${renameSha}^{commit}`]).trim();
  const rangeCommits = getNonEmptyLines(runGit(["rev-list", range]));
  if (!rangeCommits.includes(sha))
    throw new InvalidOperationError(
      Operation.Read,
      getRenameTokenOnlyPaths.name,
      `${renameSha} is not a commit in ${range}`,
    );
  const otherPaths = new Set(
    rangeCommits
      .filter((commit) => commit !== sha)
      .flatMap((commit) => getNonEmptyLines(runGit(["show", "--name-only", "--format=", commit]))),
  );
  return getNonEmptyLines(runGit(["diff", "-M", "--name-status", `${sha}^`, sha])).flatMap((row) => {
    const groups = RENAME_OR_MODIFY_ROW_REGEX.exec(row)?.groups;
    if (!groups?.oldPath) return [];
    const oldPath = groups.oldPath;
    const newPath = groups.newPath ?? oldPath;
    if (!changedPaths.has(newPath)) return [];
    if ([oldPath, newPath].some((path) => checkIsProtectedPath(path) || otherPaths.has(path))) return [];
    return checkIsSubstitutionExact(
      runGit(["show", `${sha}^:${oldPath}`]),
      runGit(["show", `${sha}:${newPath}`]),
      substitutions,
    )
      ? [newPath]
      : [];
  });
};
