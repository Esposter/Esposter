import type { RedCheckSettlement } from "#src/models/coderabbit/collect/RedCheckSettlement";
import type { RepairInput } from "#src/models/coderabbit/collect/RepairInput";

import {
  CI_FAILURE_CONCLUSION,
  EXPRESS_TRAILER,
  MAIN_BRANCH,
  QUEUE_BRANCH,
  REPAIR_EXHAUSTED_MARKER,
  REPAIR_FAILED_MARKER,
  REPAIR_SIGNATURE_SPAN_MS,
  RETRIGGER_BUFFER_MS,
  SESSION_ATTEMPT_CAP,
} from "#src/services/coderabbit/collect/constants";
import { getAttempts } from "#src/services/coderabbit/collect/getAttempts";
import { getFailureSignature } from "#src/services/coderabbit/collect/getFailureSignature";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { getSoonestDelay } from "#src/services/coderabbit/collect/getSoonestDelay";
import { openCollectorIssue } from "#src/services/coderabbit/collect/openCollectorIssue";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { readRedMainChecks } from "#src/services/coderabbit/collect/readRedMainChecks";
import { readRunJobs } from "#src/services/coderabbit/collect/readRunJobs";
import { readSignatureAttempts } from "#src/services/coderabbit/collect/readSignatureAttempts";
import { settleTransitGap } from "#src/services/coderabbit/collect/settleTransitGap";
import { takeOne } from "@esposter/shared";

// Each red run on `main`'s head judged on its own, CI's and CodeQL's alike, so a red the queue heals in one workflow
// Never hides one it does not in another: a transit gap is held (`settleTransitGap`), a signature past its repairs gets
// One issue and its wake, and the first red left is the one repaired. Bounded per failure signature
// (`getFailureSignature`): the same jobs of the same workflow are the same red on whichever head carries them, so a
// Window merged over a red head starts no fresh count, and every attempt at it — failed or pushed — is one marker on
// The head it was made at, counted across the repository's newest commit comments within a span
// (`REPAIR_SIGNATURE_SPAN_MS`) and against this collector's own source. The count drops under the cap as its oldest
// Attempts age out of the span, with no event to say so, so the run wakes itself then.
export const settleRedChecks = ({
  collectorSha,
  cwd,
  isDryRun,
  mainSha,
  viewerLogin,
}: RepairInput): RedCheckSettlement => {
  const retriggerDelays: (number | undefined)[] = [];
  for (const check of readRedMainChecks(mainSha, cwd)) {
    const { jobs, workflowName } = readRunJobs(check.databaseId);
    // The jobs CI skipped behind a failed one are no part of the red, since they name no red of their own
    const failedJobNames = jobs
      .filter(({ conclusion }) => conclusion === CI_FAILURE_CONCLUSION)
      .map(({ name }) => name);
    const transitGap = settleTransitGap({ check, cwd, failedJobNames, isDryRun, mainSha, viewerLogin });
    if (transitGap.isHeld) {
      retriggerDelays.push(transitGap.retriggerDelaySeconds);
      continue;
    }

    const signature = getFailureSignature(workflowName, failedJobNames);
    const attempts = getAttempts({
      collectorSha,
      comments: readSignatureAttempts(),
      key: signature,
      marker: REPAIR_FAILED_MARKER,
      post: (body) => {
        postCommitComment(mainSha, body);
      },
      viewerLogin,
    });
    if (attempts.attempts < SESSION_ATTEMPT_CAP) return { attempts, check, signature };

    console.info(`${MAIN_BRANCH} is red on ${signature.text} past ${attempts.attempts} repairs — its issue carries it`);
    const spanHours = Temporal.Duration.from({ milliseconds: REPAIR_SIGNATURE_SPAN_MS }).total("hours");
    openCollectorIssue({
      body: [
        `\`${MAIN_BRANCH}\` is red on ${check.url}, failing ${signature.text}.`,
        "",
        `The repairer has made ${attempts.attempts} attempts at this failure signature within ${spanHours} hours, so it repairs this signature no further. Its attempts resume once the oldest of them ages out of that span, or once the collector's own source changes. Nothing waits on it: windows go on merging and opening.`,
        "",
        `To finish: commit a repair on \`${QUEUE_BRANCH}\` that turns these jobs green, carrying the \`${EXPRESS_TRAILER}\` trailer so the express lane cuts it to \`${MAIN_BRANCH}\` unread, and close this issue once \`${MAIN_BRANCH}\` is green.`,
      ].join("\n"),
      isDryRun,
      marker: getMarker(REPAIR_EXHAUSTED_MARKER, signature, [collectorSha]),
      title: `Red ${MAIN_BRANCH} past its repairs: ${signature.text}`,
      viewerLogin,
    });
    retriggerDelays.push(
      getRetriggerDelaySeconds(
        takeOne(attempts.attemptedAtMs, attempts.attempts - SESSION_ATTEMPT_CAP) +
          REPAIR_SIGNATURE_SPAN_MS +
          RETRIGGER_BUFFER_MS -
          Date.now(),
      ),
    );
  }
  return { retriggerDelaySeconds: getSoonestDelay(...retriggerDelays) };
};
