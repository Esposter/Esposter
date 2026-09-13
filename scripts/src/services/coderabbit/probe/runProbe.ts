import { checkIsCheckpointMoved } from "#src/services/coderabbit/probe/checkIsCheckpointMoved";
import { DEADLINE_MS, POLL_INTERVAL_MS } from "#src/services/coderabbit/probe/constants";
import { getCheckpoint } from "#src/services/coderabbit/probe/getCheckpoint";
import { readNewestComment } from "#src/services/coderabbit/probe/readNewestComment";
import { PROBE_COMMENT } from "#src/services/coderabbit/shared/constants";
import { runGh } from "#src/services/coderabbit/shared/runGh";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { setTimeout as delay } from "node:timers/promises";

// Posting the retrigger and reading straight back races the bot: its reply does not exist yet, so the read
// Returns the previous comment — a real CodeRabbit remark that reads exactly like an answer. The wait is for
// The newest comment to *change*, and it is a poll because nothing pushes a bot's reply anywhere this process
// Can await. It is bounded because a bot that never answers and an API that keeps failing look identical from
// Here, and an unanswered probe is something to go and look at rather than something to keep waiting on.
export const runProbe = async (pullRequest: number): Promise<string> => {
  // Unguarded on purpose: a baseline read that failed is not a baseline, and posting the probe against one makes
  // Whatever the bot said last look like the answer. Better to fail before spending the retrigger.
  const before = getCheckpoint(readNewestComment(pullRequest));
  runGh(["pr", "comment", pullRequest.toString(), "--body", PROBE_COMMENT]);

  const deadline = Date.now() + DEADLINE_MS;
  while (Date.now() < deadline) {
    const comment = getResult(() => readNewestComment(pullRequest)).unwrapOr(undefined);
    // The caller reads the status line of whatever comes back; this loop only waits for it to arrive
    if (checkIsCheckpointMoved(before, getCheckpoint(comment))) return comment?.body ?? "";
    await delay(POLL_INTERVAL_MS);
  }

  throw new InvalidOperationError(
    Operation.Read,
    "coderabbit",
    "no reply within the deadline — read the pull request before assuming anything",
  );
};
