import { checkIsImportPathOnlyDiff } from "#src/services/coderabbit/exclusions/checkIsImportPathOnlyDiff";
import { checkIsProtectedPath } from "#src/services/coderabbit/exclusions/checkIsProtectedPath";
import { getPureRenamePaths } from "#src/services/coderabbit/exclusions/getPureRenamePaths";
import { getRenameSubstitutions } from "#src/services/coderabbit/exclusions/getRenameSubstitutions";
import { getRenameTokenOnlyPaths } from "#src/services/coderabbit/exclusions/getRenameTokenOnlyPaths";
import { getNonEmptyLines } from "#src/services/getNonEmptyLines";
import { runGit } from "#src/services/runGit";
import { InvalidOperationError, Operation } from "@esposter/shared";

// `pnpm ai:coderabbit:exclusions <base>..<head> [<rename-sha> OldName=NewName ...]`
const [range, renameSha, ...renameArgs] = process.argv.slice(2);
if (!range?.includes(".."))
  throw new InvalidOperationError(Operation.Read, "coderabbit", "a <base>..<head> range is required");

const changedPaths = getNonEmptyLines(runGit(["diff", "--name-only", "-M", range]));
const importPathOnlyPaths = changedPaths
  .filter((path) => !checkIsProtectedPath(path))
  .filter((path) => checkIsImportPathOnlyDiff(runGit(["diff", "-U0", "-M", range, "--", path])));
const renameTokenOnlyPaths =
  renameSha === undefined
    ? []
    : getRenameTokenOnlyPaths(range, new Set(changedPaths), renameSha, getRenameSubstitutions(renameArgs));
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
