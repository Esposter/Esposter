import type { RenameSubstitution } from "#src/models/coderabbit/shared/RenameSubstitution";

import { checkIsProtectedRow } from "#src/services/coderabbit/exclusions/checkIsProtectedRow";
import { checkIsSubstitutionExact } from "#src/services/coderabbit/exclusions/checkIsSubstitutionExact";
import { getNameStatusRows } from "#src/services/coderabbit/exclusions/getNameStatusRows";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { getNulSeparatedTokens } from "#src/services/shared/getNulSeparatedTokens";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A file that stayed put and changed is `M`; an `A` or a `D` is a content decision, never a token substitution
const MODIFIED_STATUS = "M";

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
  // `-z` for the same reason the name-status listing reads with it (`getNameStatusRows`): a path git would quote
  // Would otherwise never equal the literal one the rename row names, and the sibling change would go unseen
  const otherPaths = new Set(
    rangeCommits
      .filter((commit) => commit !== sha)
      .flatMap((commit) => getNulSeparatedTokens(runGit(["show", "--name-only", "--format=", "-z", commit]))),
  );
  return getNameStatusRows(runGit(["diff", "-M", "--name-status", "-z", `${sha}^`, sha])).flatMap((row) => {
    const { path, renamedFrom, status } = row;
    if (renamedFrom === undefined && status !== MODIFIED_STATUS) return [];
    const oldPath = renamedFrom ?? path;
    if (!changedPaths.has(path)) return [];
    if (checkIsProtectedRow(row) || [oldPath, path].some((somePath) => otherPaths.has(somePath))) return [];
    return checkIsSubstitutionExact(
      runGit(["show", `${sha}^:${oldPath}`]),
      runGit(["show", `${sha}:${path}`]),
      substitutions,
    )
      ? [path]
      : [];
  });
};
