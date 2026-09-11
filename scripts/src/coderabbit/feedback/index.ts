import type { GitHubEntry } from "#src/coderabbit/models/GitHubEntry";
import type { GitHubReview } from "#src/coderabbit/models/GitHubReview";

import { getFindingLines } from "#src/coderabbit/feedback/getFindingLines";
import { getLatestMarkedBlock } from "#src/coderabbit/feedback/getLatestMarkedBlock";
import { getStatedCounts } from "#src/coderabbit/feedback/getStatedCounts";
import { readUnresolvedThreads } from "#src/coderabbit/feedback/readUnresolvedThreads";
import { getPullRequestArgument } from "#src/coderabbit/services/getPullRequestArgument";
import { getSortedByUpdatedAt } from "#src/coderabbit/services/getSortedByUpdatedAt";
import { readBotEntries } from "#src/coderabbit/services/readBotEntries";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The walkthrough is one comment edited in place across every review, and these two blocks live only in it —
// A fetch of the reviews endpoint plus the inline threads reads as complete while missing both.
const WALKTHROUGH_MARKERS = ["final_review_risk", "pre_merge_checks_walkthrough"];
const IN_PROGRESS_MARKER = "review in progress by coderabbit.ai";

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
for (const { body, commentId, line, path } of threads)
  console.info(
    `${commentId.toString()} ${path}:${line?.toString() ?? "outside the diff"}\n${body.split("\n")[0] ?? ""}\n`,
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
