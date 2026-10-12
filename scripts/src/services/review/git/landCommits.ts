import { LAND_ATTEMPTS } from "#src/services/review/constants";
import { QUEUE_BRANCH } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// One attempt to land the checkout's commits on the queue: a rebase onto its tip, then a push. A rejected push, which
// Another session's landing can cause between the two, is retried by the caller.
const tryLand = (): boolean =>
  getResult(() => {
    runGit(["pull", "--rebase", "origin", QUEUE_BRANCH]);
    runGit(["push", "origin", `HEAD:${QUEUE_BRANCH}`]);
  }).match(
    () => true,
    (error) => {
      console.error(error.message);
      return false;
    },
  );

// Lands the fixer's commits, up to `LAND_ATTEMPTS` times. Returns whether they landed.
export const landCommits = (): boolean => Array.from({ length: LAND_ATTEMPTS }).some(() => tryLand());
