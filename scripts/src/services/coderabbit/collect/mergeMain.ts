import { MergeMainOutcome } from "#src/models/coderabbit/collect/MergeMainOutcome";
import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { LOCKFILE } from "#src/services/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { rmSync } from "node:fs";
import { join } from "node:path";

// A dependency bump that landed on `main` rides the window about to be pushed rather than costing a slot. The
// Lockfile conflict that merge always brings is rebuilt from the installed tree (`git` skill); any other
// Conflict aborts and leaves the fold for a person, since the rest of the window is still worth pushing.
export const mergeMain = (cwd: string): MergeMainOutcome => {
  const main = `origin/${MAIN_BRANCH}`;
  const isAlreadyMerged = getResult(() => runGit(["merge-base", "--is-ancestor", main, "HEAD"], cwd)).match(
    () => true,
    () => false,
  );
  if (isAlreadyMerged) return MergeMainOutcome.AlreadyMerged;

  return getResult(() => runGit(["merge", "--no-edit", main], cwd)).match(
    () => MergeMainOutcome.Merged,
    () => {
      const conflicted = getNonEmptyLines(runGit(["diff", "--name-only", "--diff-filter=U"], cwd));
      if (conflicted.length !== 1 || conflicted[0] !== LOCKFILE) {
        runGit(["merge", "--abort"], cwd);
        console.info(`main not folded — conflicts outside the lockfile: ${conflicted.join(", ")}`);
        return MergeMainOutcome.Conflicted;
      }
      rmSync(join(cwd, LOCKFILE));
      if (spawnPnpm(["i"], { cwd, stdio: "inherit" }).status !== 0)
        throw new InvalidOperationError(Operation.Update, "coderabbit", "the lockfile could not be rebuilt");
      runGit(["add", LOCKFILE], cwd);
      runGit(["commit", "--no-edit"], cwd);
      return MergeMainOutcome.Merged;
    },
  );
};
