import type { DrainPromptInput } from "#src/models/coderabbit/collect/DrainPromptInput";

import { getDrainsVerdictBody } from "#src/services/coderabbit/collect/getDrainsVerdictBody";
import { postComment } from "#src/services/coderabbit/collect/postComment";
import { postReply } from "#src/services/coderabbit/collect/postReply";
import { HTML_COMMENT_REGEX } from "#src/services/coderabbit/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { stripToFixedPoint } from "#src/services/coderabbit/shared/stripToFixedPoint";
import { getResult, noop } from "@esposter/shared";
import { existsSync, readFileSync } from "node:fs";

// The drain's half of the reply, posted by the only process that holds a credential: a rejection cites no sha, so
// It is answered the moment the drain ends. Best-effort because this runs before the fixes branch is pushed —
// A refusal that threw would discard a drain that succeeded, and a thread whose reply did not land keeps the bot
// As its last author, which the next run drains again.
const readLines = (path: string): string[] => (existsSync(path) ? getNonEmptyLines(readFileSync(path, "utf8")) : []);

// These lines are prose the drain wrote about untrusted review text (`runDrain`), posted under the same login
// `checkIsMarked` keys its trust on — so an HTML comment reaching this far is stripped, not trusted to be prose
const stripHtmlComments = (text: string): string => stripToFixedPoint(text, HTML_COMMENT_REGEX);

export const postDrainVerdicts = ({
  openThreads,
  pullRequest,
  rejectionsPath,
  reviewId,
  verdictPath,
}: Pick<DrainPromptInput, "openThreads" | "pullRequest" | "rejectionsPath" | "reviewId" | "verdictPath">): void => {
  const openIds = new Set(openThreads.map(({ commentId }) => commentId));
  for (const line of readLines(rejectionsPath)) {
    const [rawCommentId = "", ...reason] = line.split(" ");
    const commentId = Number(rawCommentId);
    // A line naming no open thread is skipped: a malformed id, or one the drain was never asked about
    if (!openIds.has(commentId)) {
      console.info(`skipping a rejection line that names no open thread: ${line}`);
      continue;
    }

    const body = `Not a real issue, no change — ${stripHtmlComments(reason.join(" "))}`;
    console.info(`reply ${commentId}: ${body}`);
    getResult(() => postReply(pullRequest, commentId, body)).match(noop, console.error);
  }

  const verdicts = readLines(verdictPath);
  if (verdicts.length === 0 || reviewId === undefined) return;

  const body = getDrainsVerdictBody(
    reviewId,
    "rejected",
    verdicts.map((verdict) => stripHtmlComments(verdict)),
  );
  console.info(`verdict comment for review ${reviewId}`);
  getResult(() => postComment(pullRequest, body)).match(noop, console.error);
};
