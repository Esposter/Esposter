import type { TransitGapInput } from "#src/models/coderabbit/collect/TransitGapInput";

import { checkIsMarked } from "#src/services/coderabbit/collect/checkIsMarked";
import {
  CI_SUCCESS_CONCLUSION,
  MAIN_BRANCH,
  QUEUE_BRANCH,
  TRANSIT_GAP_MARKER,
} from "#src/services/coderabbit/collect/constants";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { readCommitComments } from "#src/services/coderabbit/collect/readCommitComments";
import { readQueueCheck } from "#src/services/coderabbit/collect/readQueueCheck";
import { readRunJobs } from "#src/services/coderabbit/collect/readRunJobs";

// Whether a red `main` is a transit gap: a commit a window carried onto `main` that needs one still queued behind it —
// The rest of a commit the reshaper split across windows, the change a reader waits on — fails jobs there that the
// Queue, carrying both, passes. Nothing at `main`'s head can repair that: the repair's verify runs every check, so it
// Fails on such a job however a session answers the rest, and a session that did answer it would land a copy of what
// The queue already carries. So while any job `main` failed passes on the queue's newest verdict, the repairer spends
// No session and counts no attempt, and the windows heal it as they merge; only a red every one of whose jobs fails
// On the queue too is repaired. The verdict is recorded on `main`'s head against the queue commit whose run gave it,
// So a later pass reads it there rather than both runs' jobs, and a newer verdict on the queue is read afresh
export const checkIsTransitGap = ({
  check,
  failedJobNames,
  isDryRun,
  mainSha,
  viewerLogin,
}: TransitGapInput): boolean => {
  const queueCheck = readQueueCheck(check);
  if (!queueCheck) return false;

  const marker = getMarker(TRANSIT_GAP_MARKER, mainSha, [queueCheck.headSha]);
  if (readCommitComments(mainSha).some((comment) => checkIsMarked(comment, viewerLogin, marker))) {
    console.info(`${MAIN_BRANCH} is red on ${check.url} in a transit gap ${queueCheck.url} heals — no repair`);
    return true;
  }

  const passedJobNames = new Set(
    readRunJobs(queueCheck.databaseId)
      .jobs.filter(({ conclusion }) => conclusion === CI_SUCCESS_CONCLUSION)
      .map(({ name }) => name),
  );
  const healedJobNames = failedJobNames.filter((name) => passedJobNames.has(name));
  if (healedJobNames.length === 0) return false;

  const verdict = `${MAIN_BRANCH} is red on ${check.url} in ${healedJobNames.join(", ")}, which ${QUEUE_BRANCH} passes on ${queueCheck.url}: a transit gap its queued windows heal as they merge, so no repair is attempted while it lasts`;
  console.info(verdict);
  if (!isDryRun) postCommitComment(mainSha, `${marker}\n${verdict}.`);
  return true;
};
