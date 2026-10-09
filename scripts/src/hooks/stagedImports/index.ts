import { findMissingImports } from "#src/services/hooks/stagedImports/findMissingImports";
import { readIndexPaths } from "#src/services/hooks/stagedImports/readIndexPaths";
import { readStagedImporters } from "#src/services/hooks/stagedImports/readStagedImporters";
import { defineCommand, runMain } from "citty";
import { execFileSync } from "node:child_process";

// The pre-commit hook's check that every import a staged file makes lands on a file the commit holds, so a commit of
// One hunk never leaves a fresh checkout unable to build. `pnpm -C scripts hooks:staged-imports`, run by hand, checks
// The index as it stands
await runMain(
  defineCommand({
    meta: {
      description: "Fail when a staged file imports a file that is neither committed nor staged",
      name: "hooks:staged-imports",
    },
    run: () => {
      // The index's paths are repository-relative, and `pnpm -C scripts` starts this process inside `scripts/`
      process.chdir(execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim());
      const committedPaths = readIndexPaths();
      const missingImports = findMissingImports(readStagedImporters(committedPaths), committedPaths);
      if (missingImports.length === 0) return;

      for (const { importingPath, missingPath, specifier } of missingImports)
        console.error(
          `${importingPath} imports "${specifier}", and ${missingPath} is neither in HEAD nor staged: git add it, or leave that hunk out`,
        );
      process.exitCode = 1;
    },
  }),
);
