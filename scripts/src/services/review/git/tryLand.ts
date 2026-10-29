import { checkIsRebasing } from "#src/services/review/git/checkIsRebasing";
import { QUEUE_BRANCH } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// One attempt to land the checkout's commits on the queue: a rebase onto its tip, then a push. A rejected push, which
// Another session's landing can cause between the two, is retried by the caller. A rebase that stops on a conflict is
// Aborted, so the checkout leaves the attempt as it entered it: a rebase left in progress refuses every later pull, and
// The settle job's next settler starts in the same checkout.
export const tryLand = (cwd: string): boolean =>
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
