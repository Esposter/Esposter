import { PROBE_COMMENT } from "#src/services/coderabbit/collect/constants";
import { checkIsCheckpointMoved } from "#src/services/coderabbit/probe/checkIsCheckpointMoved";
import { DEADLINE_MS, POLL_INTERVAL_MS } from "#src/services/coderabbit/probe/constants";
import { getCheckpoint } from "#src/services/coderabbit/probe/getCheckpoint";
import { readNewestComment } from "#src/services/coderabbit/probe/readNewestComment";
import { runGh } from "#src/services/coderabbit/runGh";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { setTimeout as delay } from "node:timers/promises";

// Posting the retrigger and reading straight back races the bot: its reply does not exist yet, so the read
// Returns the previous comment — a real CodeRabbit remark that reads exactly like an answer. The wait is for
// The newest comment to *change*, and it is a poll because nothing pushes a bot's reply anywhere this process
// Can await. It is bounded because a bot that never answers and an API that keeps failing look identical from
// Here, and an unanswered probe is something to go and look at rather than something to keep waiting on.
export const runProbe = async (pullRequest: number): Promise<string> => {
  const before = getCheckpoint(readNewestComment(pullRequest));
  runGh(["pr", "comment", pullRequest.toString(), "--body", PROBE_COMMENT]);

  const deadline = Date.now() + DEADLINE_MS;
  while (Date.now() < deadline) {
    const comment = readNewestComment(pullRequest);
    // "Already reviewed" means the checkpoint already covers the head; anything else is a review starting
    if (checkIsCheckpointMoved(before, getCheckpoint(comment))) return comment?.body ?? "";
    await delay(POLL_INTERVAL_MS);
  }

  throw new InvalidOperationError(
    Operation.Read,
    "coderabbit",
    "no reply within the deadline — read the pull request before assuming anything",
  );
};
