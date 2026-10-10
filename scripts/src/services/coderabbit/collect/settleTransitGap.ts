import type { TransitGapInput } from "#src/models/coderabbit/collect/TransitGapInput";
import type { TransitGapSettlement } from "#src/models/coderabbit/collect/TransitGapSettlement";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import { checkIsQueuedChange } from "#src/services/coderabbit/collect/checkIsQueuedChange";
import {
  CI_SUCCESS_CONCLUSION,
  MAIN_BRANCH,
  QUEUE_BRANCH,
  RETRIGGER_BUFFER_MS,
  TRANSIT_GAP_MARKER,
} from "#src/services/coderabbit/collect/constants";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { readCarryingCheck } from "#src/services/coderabbit/collect/readCarryingCheck";
import { readCommitComments } from "#src/services/coderabbit/collect/readCommitComments";
import { readFailurePaths } from "#src/services/coderabbit/collect/readFailurePaths";
import { readQueueCheck } from "#src/services/coderabbit/collect/readQueueCheck";
import { readRunJobs } from "#src/services/coderabbit/collect/readRunJobs";
import { readSha } from "#src/services/coderabbit/collect/readSha";
import { rerunRedCheck } from "#src/services/coderabbit/collect/rerunRedCheck";

// Whether a red `main` is a transit gap: a commit a window carried onto `main` that needs one still queued behind it —
// The rest of a commit the reshaper split across windows, the change a reader waits on — fails jobs there that the
// Queue, carrying both, passes. Nothing at `main`'s head can repair that: the repair's verify runs every check, so it
// Fails on such a job however a session answers the rest, and a session that did answer it would land a copy of what
// The queue already carries. So while any job `main` failed passes on the queue's verdict over that head, the repairer
// Spends no session and counts no attempt, and the windows heal it as they merge; only a red every one of whose jobs
// Fails on the queue too is repaired. The verdict is recorded on `main`'s head against the queue commit whose run gave
// It, so a later pass reads it there rather than both runs' jobs, and a newer verdict on the queue is read afresh. A
// Verdict over `main`'s own tree heals nothing queued, so a job it passes is no gap but a flake, run again once
// (`rerunRedCheck`). Nothing fires a pass when a queue run concludes, nor when no window is left in flight to merge
// Over a gap, so every held red wakes the run itself once the newest queue run's span from push to verdict has passed
// Again; while windows merge, their own events wake it sooner and the newest run's wake replaces this one. A workflow
// The queue never runs — CodeQL, which scans `main` alone — has no queued verdict, so its red is judged by the files it
// Names instead: a gap when the queue's head changes every one of them (`checkIsQueuedChange`), woken once its own
// Run's span has passed again, since no queue run of it exists to measure
export const settleTransitGap = ({
  check,
  cwd,
  failedJobs,
  isDryRun,
  mainSha,
  viewerLogin,
}: TransitGapInput): TransitGapSettlement => {
  const newestCheck = readQueueCheck(check);
  const spanCheck = newestCheck ?? check;
  const runMs =
    Temporal.Instant.from(spanCheck.updatedAt).epochMilliseconds -
    Temporal.Instant.from(spanCheck.createdAt).epochMilliseconds;
  const held: TransitGapSettlement = {
    isHeld: true,
    retriggerDelaySeconds: getRetriggerDelaySeconds(runMs + RETRIGGER_BUFFER_MS),
  };
  if (!newestCheck) {
    const failurePaths = readFailurePaths(check.workflowFile, failedJobs);
    if (!checkIsQueuedChange(failurePaths, mainSha, cwd)) return { isHeld: false };

    console.info(
      `${MAIN_BRANCH} is red on ${check.url} in ${failurePaths.join(", ")}, which ${QUEUE_BRANCH} changes: a transit gap its queued windows heal as they merge, so no repair is attempted while it lasts`,
    );
    return held;
  }

  const queueCheck = readCarryingCheck(newestCheck, mainSha, cwd);
  if (!queueCheck) {
    console.info(
      `${MAIN_BRANCH} is red on ${check.url}, which ${newestCheck.headBranch}'s newest verdict ${newestCheck.url} predates — held until its run over the head concludes, retrigger in ${held.retriggerDelaySeconds}s`,
    );
    return held;
  }

  const isSameTree = readSha(`${queueCheck.headSha}^{tree}`, cwd) === readSha(`${mainSha}^{tree}`, cwd);
  const marker = getMarker(TRANSIT_GAP_MARKER, mainSha, [queueCheck.headSha]);
  if (!isSameTree && readCommitComments(mainSha).some((comment) => checkIsMarked(comment, viewerLogin, marker))) {
    console.info(`${MAIN_BRANCH} is red on ${check.url} in a transit gap ${queueCheck.url} heals — no repair`);
    return held;
  }

  const passedJobNames = new Set(
    readRunJobs(queueCheck.databaseId)
      .jobs.filter(({ conclusion }) => conclusion === CI_SUCCESS_CONCLUSION)
      .map(({ name }) => name),
  );
  const healedJobNames = failedJobs.map(({ name }) => name).filter((name) => passedJobNames.has(name));
  if (healedJobNames.length === 0) return { isHeld: false };
  else if (isSameTree)
    return rerunRedCheck({ check, isDryRun, mainSha, queueCheck, viewerLogin }) ? held : { isHeld: false };

  const verdict = `${MAIN_BRANCH} is red on ${check.url} in ${healedJobNames.join(", ")}, which ${queueCheck.headBranch} passes on ${queueCheck.url}: a transit gap its queued windows heal as they merge, so no repair is attempted while it lasts`;
  console.info(verdict);
  if (!isDryRun) postCommitComment(mainSha, `${marker}\n${verdict}.`);
  return held;
};
