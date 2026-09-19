import type { FeedbackReportInput } from "#src/models/coderabbit/feedback/FeedbackReportInput";

import { IN_PROGRESS_MARKER, WALKTHROUGH_MARKERS } from "#src/services/coderabbit/feedback/constants";
import { getFindingLines } from "#src/services/coderabbit/feedback/getFindingLines";
import { getLatestMarkedBlock } from "#src/services/coderabbit/feedback/getLatestMarkedBlock";
import { getStatedCounts } from "#src/services/coderabbit/feedback/getStatedCounts";
import { CODERABBIT_REST_LOGIN } from "#src/services/coderabbit/shared/constants";
import { getSortedByUpdatedAt } from "#src/services/coderabbit/shared/getSortedByUpdatedAt";

// Every finding of a run in the shape the skill teaches reading it: the newest body's buckets, each unresolved
// Thread by id, the stated counts reconciled against the threads in hand, and the two walkthrough blocks that
// Live nowhere else. One string, so the CLI prints it and the drain is handed it.
export const getFeedbackReport = ({ issueComments, isThreadListed, review, threads }: FeedbackReportInput): string => {
  const counts = getStatedCounts(review.body);
  const lines = [
    `##### review of ${review.commit_id} submitted ${review.submitted_at}`,
    ...getFindingLines(review.body),
    "",
    `##### ${threads.length} unresolved threads`,
  ];
  // Every finding opens with its severity tag; the bold line after it is the one that says what the finding is
  if (isThreadListed)
    for (const { body, commentId, line, path } of threads)
      lines.push(
        `${commentId} ${path}:${line?.toString() ?? "outside the diff"}`,
        body.split("\n").find((entry) => entry.startsWith("**")) ?? "",
        "",
      );
  // Inline comments can fail to post outright, and the review says so in a caution block nobody reads. The
  // Stated count against the threads in hand says the same thing as a number, every run.
  lines.push(
    `##### stated ${counts.actionable} actionable, ${counts.nitpick} nitpick, ${counts.outsideDiff} outside diff`,
  );
  if (threads.length < counts.actionable)
    lines.push(
      `##### ${counts.actionable - threads.length} actionable findings have no open thread — resolved already, or they failed to post`,
    );

  const bodies = getSortedByUpdatedAt(issueComments.filter(({ user }) => user.login === CODERABBIT_REST_LOGIN)).map(
    ({ body }) => body,
  );
  if (bodies.at(-1)?.includes(IN_PROGRESS_MARKER)) lines.push("", "##### REVIEW IN PROGRESS — a push cancels it");
  for (const marker of WALKTHROUGH_MARKERS) {
    const block = getLatestMarkedBlock(bodies, marker);
    if (block === undefined) continue;

    lines.push("", `##### ${marker}`, ...getFindingLines(block));
  }

  return lines.join("\n");
};
