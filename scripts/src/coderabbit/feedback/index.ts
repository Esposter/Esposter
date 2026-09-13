import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";
import type { GitHubReview } from "#src/models/coderabbit/shared/GitHubReview";

import { IN_PROGRESS_MARKER, WALKTHROUGH_MARKERS } from "#src/services/coderabbit/feedback/constants";
import { getFindingLines } from "#src/services/coderabbit/feedback/getFindingLines";
import { getLatestMarkedBlock } from "#src/services/coderabbit/feedback/getLatestMarkedBlock";
import { getStatedCounts } from "#src/services/coderabbit/feedback/getStatedCounts";
import { readUnresolvedThreads } from "#src/services/coderabbit/feedback/readUnresolvedThreads";
import { getPullRequestArgument } from "#src/services/coderabbit/shared/getPullRequestArgument";
import { getSortedByUpdatedAt } from "#src/services/coderabbit/shared/getSortedByUpdatedAt";
import { readBotEntries } from "#src/services/coderabbit/shared/readBotEntries";
import { InvalidOperationError, Operation } from "@esposter/shared";

const pullRequest = getPullRequestArgument();
// Only the newest review is read: an older body still lists findings later commits fixed, and nothing edits it
const review = readBotEntries<GitHubReview>(`pulls/${pullRequest.toString()}/reviews`).findLast(({ body }) => body);
if (!review)
  throw new InvalidOperationError(
    Operation.Read,
    "coderabbit",
    `no review body on pull request ${pullRequest.toString()}`,
  );

const counts = getStatedCounts(review.body);
console.info(`##### review of ${review.commit_id} submitted ${review.submitted_at}`);
for (const line of getFindingLines(review.body)) console.info(line);

const threads = readUnresolvedThreads(pullRequest);
console.info(`\n##### ${threads.length.toString()} unresolved threads`);
// Every finding opens with its severity tag; the bold line after it is the one that says what the finding is
for (const { body, commentId, line, path } of threads)
  console.info(
    `${commentId.toString()} ${path}:${line?.toString() ?? "outside the diff"}\n${body.split("\n").find((entry) => entry.startsWith("**")) ?? ""}\n`,
  );

// Inline comments can fail to post outright, and the review says so in a caution block nobody reads. The
// Stated count against the threads in hand says the same thing as a number, every run.
console.info(
  `##### stated ${counts.actionable.toString()} actionable, ${counts.nitpick.toString()} nitpick, ${counts.outsideDiff.toString()} outside diff`,
);
if (threads.length < counts.actionable)
  console.info(
    `##### ${(counts.actionable - threads.length).toString()} actionable findings have no open thread — resolved already, or they failed to post`,
  );

const bodies = getSortedByUpdatedAt(readBotEntries<GitHubEntry>(`issues/${pullRequest.toString()}/comments`)).map(
  ({ body }) => body,
);
if (bodies.at(-1)?.includes(IN_PROGRESS_MARKER)) console.info("\n##### REVIEW IN PROGRESS — a push cancels it");
for (const marker of WALKTHROUGH_MARKERS) {
  const block = getLatestMarkedBlock(bodies, marker);
  if (block === undefined) continue;
  console.info(`\n##### ${marker}`);
  for (const line of getFindingLines(block)) console.info(line);
}
