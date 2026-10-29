import { checkIsRebaseInProgress } from "#src/services/land/checkIsRebaseInProgress";
import { LANDING_EXIT_STATUS, MAX_LANDING_ATTEMPTS } from "#src/services/land/constants";
import { readRebaseConflicts } from "#src/services/land/readRebaseConflicts";
import { readRemovalLine } from "#src/services/land/readRemovalLine";
import { verifyLanded } from "#src/services/land/verifyLanded";
import { waitBeforeRetry } from "#src/services/land/waitBeforeRetry";
import { runPrecheck } from "#src/services/precheck/runPrecheck";
import { checkIsLinkedWorktree } from "#src/services/queue/checkIsLinkedWorktree";
import { readMainCheckoutRoot } from "#src/services/queue/readMainCheckoutRoot";
import { QUEUE_BRANCH, REMOTE_NAME, REMOTE_QUEUE_REF, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { spawnGit } from "#src/services/shared/spawnGit";
import { removeWorktree } from "#src/services/worktree/remove/removeWorktree";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";

// Runs the precheck, then pulls and pushes up to the attempt limit, since another session's push can take the queue
// Between the two. The pull replays this checkout's own commits, so a conflict stops the landing for its author to settle
export const landQueue = async (remove: boolean, skipPrecheck: boolean): Promise<number> => {
  if (!skipPrecheck) {
    const report = runPrecheck(false);
    if (report.distributionMissing) {
      console.info(
        `${readMainCheckoutRoot()}/packages/configuration/dist is missing: vp run build:configuration there`,
      );
      return LANDING_EXIT_STATUS.distributionMissing;
    }
    if (report.findings.length > 0) {
      for (const finding of report.findings) console.info(finding);
      return LANDING_EXIT_STATUS.precheckFailed;
    }
  }

  let landedCount: number | undefined;
  for (let attempt = 1; landedCount === undefined; attempt += 1) {
    const pull = spawnGit(["pull", "--rebase", REMOTE_NAME, QUEUE_BRANCH]);
    if (pull.status !== 0 && checkIsRebaseInProgress()) {
      for (const path of readRebaseConflicts()) console.info(`conflict ${path}`);
      return LANDING_EXIT_STATUS.conflicted;
    }
    if (pull.status !== 0) {
      // oxlint-disable-next-line no-await-in-loop -- each attempt pulls the queue the one before it failed to land on
      await waitBeforeRetry(pull.stderr, attempt, MAX_LANDING_ATTEMPTS);
      continue;
    }
    // Counted after the pull has replayed this checkout's commits onto the queue's tip, so it is what this push adds
    const unlandedCount = Number(runGit(["rev-list", "--count", `${REMOTE_QUEUE_REF}..HEAD`]).trim());
    const push = spawnGit(["push", REMOTE_NAME, `HEAD:${QUEUE_BRANCH}`]);
    if (push.status === 0) landedCount = unlandedCount;
    // oxlint-disable-next-line no-await-in-loop -- each attempt pushes onto the queue the one before it found taken
    else await waitBeforeRetry(push.stderr, attempt, MAX_LANDING_ATTEMPTS);
  }

  if (!verifyLanded())
    throw new InvalidOperationError(Operation.Update, QUEUE_BRANCH, "the push reported success, but origin lacks HEAD");
  console.info(`landed ${runGit(["rev-parse", "--short", "HEAD"]).trim()} (${landedCount} commits)`);

  if (remove) {
    if (!checkIsLinkedWorktree())
      throw new InvalidOperationError(
        Operation.Delete,
        REPOSITORY_ROOT,
        "the main checkout is not a worktree to remove",
      );
    const mainCheckoutRoot = readMainCheckoutRoot();
    // The process leaves the worktree first, since Windows refuses to delete a folder some process has as its cwd. The
    // Commits are on the queue by now, so a removal refused is a line naming the command that retries it, not a failure
    process.chdir(mainCheckoutRoot);
    // A removal can fail after the folder is gone (git refuses the branch), so the folder decides the line, not the throw
    const isRemoved = getResult(() => {
      removeWorktree(REPOSITORY_ROOT, mainCheckoutRoot);
    }).match(
      () => true,
      () => !existsSync(REPOSITORY_ROOT),
    );
    console.info(readRemovalLine(REPOSITORY_ROOT, isRemoved));
  }
  return LANDING_EXIT_STATUS.landed;
};
