import { MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { runGit } from "#src/services/coderabbit/runGit";
import { getNonEmptyLines } from "#src/services/getNonEmptyLines";
import { getResult } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { join } from "node:path";

const LOCKFILE = "pnpm-lock.yaml";

// Fold `main` into the candidate so a dependency bump that landed there rides the window the collector is about
// To push, rather than costing a review slot of its own. The lockfile conflict that merge always brings is
// Resolved the git skill's way — thrown away and rebuilt from the installed tree — and any other conflict aborts
// The merge and leaves the fold for a person, since the rest of the window is still worth pushing.
// Returns whether a merge commit was made.
export const mergeMain = (cwd: string): boolean => {
  const main = `origin/${MAIN_BRANCH}`;
  const isAlreadyMerged = getResult(() => runGit(["merge-base", "--is-ancestor", main, "HEAD"], cwd)).match(
    () => true,
    () => false,
  );
  if (isAlreadyMerged) return false;

  return getResult(() => runGit(["merge", "--no-edit", main], cwd)).match(
    () => true,
    () => {
      const conflicted = getNonEmptyLines(runGit(["diff", "--name-only", "--diff-filter=U"], cwd));
      if (conflicted.length !== 1 || conflicted[0] !== LOCKFILE) {
        runGit(["merge", "--abort"], cwd);
        console.info(`main not folded — conflicts outside the lockfile: ${conflicted.join(", ")}`);
        return false;
      }
      rmSync(join(cwd, LOCKFILE));
      execFileSync("pnpm", ["i"], { cwd, encoding: "utf8", shell: process.platform === "win32", stdio: "inherit" });
      runGit(["add", LOCKFILE], cwd);
      runGit(["commit", "--no-edit"], cwd);
      return true;
    },
  );
};
