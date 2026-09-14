import type { DrainPromptInput } from "#src/models/coderabbit/collect/DrainPromptInput";

import { getDrainsVerdictBody } from "#src/services/coderabbit/collect/getDrainsVerdictBody";
import { runGh } from "#src/services/coderabbit/shared/runGh";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { getResult } from "@esposter/shared";
import { existsSync, readFileSync } from "node:fs";

// The drain's half of the reply, posted by the only process that holds a credential. A rejection is answered
// The moment the drain ends — it cites no sha, so nothing waits for the push — while an accepted finding's
// Reply is `replyAnswered`'s, after the window lands on `develop`.
//
// Best-effort for the same reason that one is, and one more: this runs before the fixes branch is pushed, so a
// GitHub refusal that threw here would discard a drain that had already succeeded. A thread whose reply did not
// Land keeps the bot as its last author, which is the open set the next run drains again — the reporting retries
// Itself, where the session that produced the commits does not.
const readLines = (path: string): string[] => (existsSync(path) ? getNonEmptyLines(readFileSync(path, "utf8")) : []);

// Every marker this pipeline reads back is an HTML comment (`getMarker`), and these lines are prose the drain
// Wrote about untrusted review text it must not trust either (`runDrain`). A successful injection cannot call
// `gh` itself, but it can choose what ends up in a reply this process posts under its own login — the same
// Login `checkIsMarked` keys its trust on — so a comment sequence reaching that far is
// Stripped before anything leaves the drain's sandbox, rather than trusted to merely be prose
const stripHtmlComments = (text: string): string => text.replaceAll(/<!--[\s\S]*?-->/gu, "");

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
    // A line naming no open thread is skipped rather than posted: a malformed id, or one the drain — which reads
    // Review text it must not trust — was never asked about
    if (!openIds.has(commentId)) {
      console.info(`skipping a rejection line that names no open thread: ${line}`);
      continue;
    }

    const body = `Not a real issue, no change — ${stripHtmlComments(reason.join(" "))}`;
    console.info(`reply ${commentId}: ${body}`);
    getResult(() =>
      runGh(["api", `repos/{owner}/{repo}/pulls/${pullRequest}/comments/${commentId}/replies`, "-f", `body=${body}`]),
    ).orTee(console.error);
  }

  const verdicts = readLines(verdictPath);
  if (verdicts.length === 0 || reviewId === undefined) return;

  const body = getDrainsVerdictBody(
    reviewId,
    "rejected",
    verdicts.map((verdict) => stripHtmlComments(verdict)),
  );
  console.info(`verdict comment for review ${reviewId}`);
  getResult(() => runGh(["pr", "comment", pullRequest.toString(), "--body", body])).orTee(console.error);
};
