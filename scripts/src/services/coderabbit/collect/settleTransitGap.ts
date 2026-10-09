import type { TransitGapInput } from "#src/models/coderabbit/collect/TransitGapInput";
import type { TransitGapSettlement } from "#src/models/coderabbit/collect/TransitGapSettlement";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import {
  CI_SUCCESS_CONCLUSION,
  MAIN_BRANCH,
  RETRIGGER_BUFFER_MS,
  TRANSIT_GAP_MARKER,
} from "#src/services/coderabbit/collect/constants";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { readCarryingCheck } from "#src/services/coderabbit/collect/readCarryingCheck";
import { readCommitComments } from "#src/services/coderabbit/collect/readCommitComments";
import { readQueueCheck } from "#src/services/coderabbit/collect/readQueueCheck";
import { readRunJobs } from "#src/services/coderabbit/collect/readRunJobs";

// Whether a red `main` is a transit gap: a commit a window carried onto `main` that needs one still queued behind it —
// The rest of a commit the reshaper split across windows, the change a reader waits on — fails jobs there that the
// Queue, carrying both, passes. Nothing at `main`'s head can repair that: the repair's verify runs every check, so it
// Fails on such a job however a session answers the rest, and a session that did answer it would land a copy of what
// The queue already carries. So while any job `main` failed passes on the queue's verdict over that head, the repairer
// Spends no session and counts no attempt, and the windows heal it as they merge; only a red every one of whose jobs
// Fails on the queue too is repaired. The verdict is recorded on `main`'s head against the queue commit whose run gave
// It, so a later pass reads it there rather than both runs' jobs, and a newer verdict on the queue is read afresh.
// While the queue's run over the head is still going the red is held too, and since nothing fires a pass when a queue
// Run concludes, the run wakes itself once the newest one's span from push to verdict has passed again
export const settleTransitGap = ({
  check,
  cwd,
  failedJobNames,
  isDryRun,
  mainSha,
  viewerLogin,
}: TransitGapInput): TransitGapSettlement => {
  const newestCheck = readQueueCheck(check);
  if (!newestCheck) return { isHeld: false };

  const queueCheck = readCarryingCheck(newestCheck, mainSha, cwd);
  if (!queueCheck) {
    const runMs =
      Temporal.Instant.from(newestCheck.updatedAt).epochMilliseconds -
      Temporal.Instant.from(newestCheck.createdAt).epochMilliseconds;
    const retriggerDelaySeconds = getRetriggerDelaySeconds(runMs + RETRIGGER_BUFFER_MS);
    console.info(
      `${MAIN_BRANCH} is red on ${check.url}, which ${newestCheck.headBranch}'s newest verdict ${newestCheck.url} predates — held until its run over the head concludes, retrigger in ${retriggerDelaySeconds}s`,
    );
    return { isHeld: true, retriggerDelaySeconds };
  }

  const marker = getMarker(TRANSIT_GAP_MARKER, mainSha, [queueCheck.headSha]);
  if (readCommitComments(mainSha).some((comment) => checkIsMarked(comment, viewerLogin, marker))) {
    console.info(`${MAIN_BRANCH} is red on ${check.url} in a transit gap ${queueCheck.url} heals — no repair`);
    return { isHeld: true };
  }

  const passedJobNames = new Set(
    readRunJobs(queueCheck.databaseId)
      .jobs.filter(({ conclusion }) => conclusion === CI_SUCCESS_CONCLUSION)
      .map(({ name }) => name),
  );
  const healedJobNames = failedJobNames.filter((name) => passedJobNames.has(name));
  if (healedJobNames.length === 0) return { isHeld: false };

  const verdict = `${MAIN_BRANCH} is red on ${check.url} in ${healedJobNames.join(", ")}, which ${queueCheck.headBranch} passes on ${queueCheck.url}: a transit gap its queued windows heal as they merge, so no repair is attempted while it lasts`;
  console.info(verdict);
  if (!isDryRun) postCommitComment(mainSha, `${marker}\n${verdict}.`);
  return { isHeld: true };
};
