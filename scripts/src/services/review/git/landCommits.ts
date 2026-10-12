import { LAND_ATTEMPTS } from "#src/services/review/constants";
import { QUEUE_BRANCH, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

// Whether the checkout holds a rebase that stopped on a conflict: git keeps its state in `rebase-merge` until it ends
const checkIsRebasing = (cwd: string): boolean =>
  existsSync(resolve(cwd, runGit(["rev-parse", "--git-path", "rebase-merge"], cwd).trim()));

// One attempt to land the checkout's commits on the queue: a rebase onto its tip, then a push. A rejected push, which
// Another session's landing can cause between the two, is retried by the caller. A rebase that stops on a conflict is
// Aborted, so the checkout leaves the attempt as it entered it: a rebase left in progress refuses every later pull, and
// The settle job's next settler starts in the same checkout.
const tryLand = (cwd: string): boolean =>
  getResult(() => {
    runGit(["pull", "--rebase", "origin", QUEUE_BRANCH], cwd);
    runGit(["push", "origin", `HEAD:${QUEUE_BRANCH}`], cwd);
  }).match(
    () => true,
    (error) => {
      console.error(error.message);
      if (checkIsRebasing(cwd)) runGit(["rebase", "--abort"], cwd);
      return false;
    },
  );

// Lands the fixer's commits, up to `LAND_ATTEMPTS` times. Returns whether they landed.
export const landCommits = (cwd: string = REPOSITORY_ROOT): boolean =>
  Array.from({ length: LAND_ATTEMPTS }).some(() => tryLand(cwd));
