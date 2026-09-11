import type { RenameSubstitution } from "#src/coderabbit/models/RenameSubstitution";

import { checkIsImportPathOnlyDiff } from "#src/coderabbit/exclusions/checkIsImportPathOnlyDiff";
import { checkIsProtectedPath } from "#src/coderabbit/exclusions/checkIsProtectedPath";
import { checkIsSubstitutionExact } from "#src/coderabbit/exclusions/checkIsSubstitutionExact";
import { getPureRenamePaths } from "#src/coderabbit/exclusions/getPureRenamePaths";
import { getRenameSubstitutions } from "#src/coderabbit/exclusions/getRenameSubstitutions";
import { runGit } from "#src/services/runGit";
import { InvalidOperationError, Operation } from "@esposter/shared";

// `R` carries the old and new paths; `M` reuses the one path. `A`/`D` are content decisions, never mechanical
const RENAME_OR_MODIFY_ROW_REGEX = /^(?<status>R\d*|M)\t(?<oldPath>[^\t]+)(?:\t(?<newPath>[^\t]+))?$/u;

const getLines = (output: string): string[] => output.split("\n").filter(Boolean);
// The sweep's own commit is the one whose substitutions are replayed, and it must be one of the range's: a sha
// Outside it would let paths the range never changed into a static filter that then swallows a later real change
// To them. A file any sibling commit in the range also touched carries a content change under either of its paths,
// So it stays in — and so does a rename out of a protected tree, which is still a change to that tree.
const getRenameTokenOnlyPaths = (
  range: string,
  changedPaths: readonly string[],
  renameSha: string,
  substitutions: RenameSubstitution[],
): string[] => {
  const sha = runGit(["rev-parse", "--verify", `${renameSha}^{commit}`]).trim();
  const rangeCommits = getLines(runGit(["rev-list", range]));
  if (!rangeCommits.includes(sha))
    throw new InvalidOperationError(Operation.Read, "coderabbit", `${renameSha} is not a commit in ${range}`);
  const otherPaths = new Set(
    rangeCommits
      .filter((commit) => commit !== sha)
      .flatMap((commit) => getLines(runGit(["show", "--name-only", "--format=", commit]))),
  );
  return getLines(runGit(["diff", "-M", "--name-status", `${sha}^`, sha])).flatMap((row) => {
    const groups = RENAME_OR_MODIFY_ROW_REGEX.exec(row)?.groups;
    if (!groups?.oldPath) return [];
    const oldPath = groups.oldPath;
    const newPath = groups.newPath ?? oldPath;
    if (!changedPaths.includes(newPath)) return [];
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

// `pnpm ai:coderabbit:exclusions <base>..<head> [<rename-sha> OldName=NewName ...]`
const [range, renameSha, ...renameArgs] = process.argv.slice(2);
if (!range?.includes(".."))
  throw new InvalidOperationError(Operation.Read, "coderabbit", "a <base>..<head> range is required");

const changedPaths = getLines(runGit(["diff", "--name-only", "-M", range]));
const importPathOnlyPaths = changedPaths
  .filter((path) => !checkIsProtectedPath(path))
  .filter((path) => checkIsImportPathOnlyDiff(runGit(["diff", "-U0", "-M", range, "--", path])));
const renameTokenOnlyPaths =
  renameSha === undefined
    ? []
    : getRenameTokenOnlyPaths(range, changedPaths, renameSha, getRenameSubstitutions(renameArgs));
const excludablePaths = [
  ...new Set([
    ...getPureRenamePaths(runGit(["diff", "--name-status", "-M", range])).filter((path) => !checkIsProtectedPath(path)),
    ...importPathOnlyPaths,
    ...renameTokenOnlyPaths,
  ]),
].toSorted();

// The summary is a yaml comment so the whole output pastes into `path_filters` as it is
console.info(`    # ${excludablePaths.length.toString()} of ${changedPaths.length.toString()} changed files qualify`);
for (const path of excludablePaths) console.info(`    - "!${path}"`);
