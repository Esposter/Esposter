import type { GitHubEntry } from "#src/coderabbit/models/GitHubEntry";

import { checkIsCheckpointMoved } from "#src/coderabbit/probe/checkIsCheckpointMoved";
import { getPullRequestArgument } from "#src/coderabbit/services/getPullRequestArgument";
import { getSortedByUpdatedAt } from "#src/coderabbit/services/getSortedByUpdatedAt";
import { readBotEntries } from "#src/coderabbit/services/readBotEntries";
import { runGh } from "#src/coderabbit/services/runGh";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { setTimeout as delay } from "node:timers/promises";

const POLL_INTERVAL_MS = Temporal.Duration.from({ seconds: 10 }).total("milliseconds");
const DEADLINE_MS = Temporal.Duration.from({ minutes: 10 }).total("milliseconds");

const readNewestComment = (pullRequest: number): GitHubEntry | undefined =>
  getResult(() => getSortedByUpdatedAt(readBotEntries<GitHubEntry>(`issues/${pullRequest.toString()}/comments`)).at(-1))
    // A read that threw is not a checkpoint, and an empty reading is what says so downstream
    .unwrapOr(undefined);

const getCheckpoint = (comment: GitHubEntry | undefined): string =>
  comment ? `${comment.id.toString()} ${comment.updated_at}` : "";

// Posting the retrigger and reading straight back races the bot: its reply does not exist yet, so the read
// Returns the previous comment — a real CodeRabbit remark that reads exactly like an answer. The wait is for
// The newest comment to *change*, and it is a poll because nothing pushes a bot's reply anywhere this process
// Can await. It is bounded because a bot that never answers and an API that keeps failing look identical from
// Here, and an unanswered probe is something to go and look at rather than something to keep waiting on.
const pullRequest = getPullRequestArgument();
const before = getCheckpoint(readNewestComment(pullRequest));
runGh(["pr", "comment", pullRequest.toString(), "--body", "@coderabbitai review"]);

const deadline = Date.now() + DEADLINE_MS;
while (Date.now() < deadline) {
  const comment = readNewestComment(pullRequest);
  if (checkIsCheckpointMoved(before, getCheckpoint(comment))) {
    // "Already reviewed" means the checkpoint already covers the head; anything else is a review starting
    console.info(comment?.body ?? "");
    process.exit(0);
  }
  await delay(POLL_INTERVAL_MS);
}

throw new InvalidOperationError(
  Operation.Read,
  "coderabbit",
  "no reply within the deadline — read the pull request before assuming anything",
);
