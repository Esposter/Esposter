import { checkIsProtectedPath } from "#src/services/coderabbit/exclusions/checkIsProtectedPath";
import { getRenameSubstitutions } from "#src/services/coderabbit/exclusions/getRenameSubstitutions";
import { getRenameTokenOnlyPaths } from "#src/services/coderabbit/exclusions/getRenameTokenOnlyPaths";
import { readMechanicalPaths } from "#src/services/coderabbit/exclusions/readMechanicalPaths";
import { InvalidOperationError, Operation } from "@esposter/shared";

// `pnpm ai:coderabbit:exclusions <base>..<head> [<rename-sha> OldName=NewName ...]`
const [range, renameSha, ...renameArgs] = process.argv.slice(2);
if (!range?.includes(".."))
  throw new InvalidOperationError(Operation.Read, "coderabbit", "a <base>..<head> range is required");

const { mechanicalPaths, rows } = readMechanicalPaths([range]);
const changedPaths = new Set(rows.map(({ path }) => path));
const renameTokenOnlyPaths =
  renameSha === undefined
    ? []
    : getRenameTokenOnlyPaths(range, changedPaths, renameSha, getRenameSubstitutions(renameArgs));
// The protected classes never leave review on a content proof, and a token-only path was already tested for them
const excludablePaths = [...new Set([...mechanicalPaths, ...renameTokenOnlyPaths])]
  .filter((path) => !checkIsProtectedPath(path))
  .toSorted();

// The summary is a yaml comment so the whole output pastes into `path_filters` as it is
console.info(`    # ${excludablePaths.length.toString()} of ${changedPaths.size.toString()} changed files qualify`);
for (const path of excludablePaths) console.info(`    - "!${path}"`);
