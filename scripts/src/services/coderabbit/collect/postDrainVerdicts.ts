import type { DrainPromptInput } from "#src/models/coderabbit/collect/DrainPromptInput";

import { getMarker } from "#src/services/coderabbit/collect/checkHasMarkerComment";
import { DRAINS_MARKER } from "#src/services/coderabbit/collect/constants";
import { runGh } from "#src/services/coderabbit/runGh";
import { getNonEmptyLines } from "#src/services/getNonEmptyLines";
import { existsSync, readFileSync } from "node:fs";

// The drain's half of the reply, posted by the only process that holds a credential. A rejection is answered
// The moment the drain ends — it cites no sha, so nothing waits for the push — while an accepted finding's
// Reply is `replyAnswered`'s, after the window lands on `develop`.
const readLines = (path: string): string[] => (existsSync(path) ? getNonEmptyLines(readFileSync(path, "utf8")) : []);

// Every marker this pipeline reads back is an HTML comment (`getMarker`), and these lines are prose the drain
// Wrote about untrusted review text it must not trust either (`runDrain`). A successful injection cannot call
// `gh` itself, but it can choose what ends up in a reply this process posts under its own login — the same
// Login `checkHasMarkerComment` and friends key their trust on — so a comment sequence reaching that far is
// Stripped before anything leaves the drain's sandbox, rather than trusted to merely be prose
const stripHtmlComments = (text: string): string => text.replaceAll(/<!--[\s\S]*?-->/gu, "");

export const postDrainVerdicts = ({
  pullRequest,
  rejectionsPath,
  reviewId,
  verdictPath,
}: Pick<DrainPromptInput, "pullRequest" | "rejectionsPath" | "reviewId" | "verdictPath">): void => {
  for (const line of readLines(rejectionsPath)) {
    const [commentId = "", ...reason] = line.split(" ");
    // A line the drain wrote malformed is skipped rather than posted against whatever id `parseInt` invents
    if (!/^\d+$/u.test(commentId)) {
      console.info(`skipping a rejection line with no comment id: ${line}`);
      continue;
    }

    const body = `Not a real issue, no change — ${stripHtmlComments(reason.join(" "))}`;
    console.info(`reply ${commentId}: ${body}`);
    runGh([
      "api",
      `repos/{owner}/{repo}/pulls/${pullRequest.toString()}/comments/${commentId}/replies`,
      "-f",
      `body=${body}`,
    ]);
  }

  const verdicts = readLines(verdictPath);
  if (verdicts.length === 0 || reviewId === undefined) return;

  const body = `${getMarker(DRAINS_MARKER, reviewId)}\nBody-only findings of review ${reviewId.toString()} are rejected:\n${verdicts.map(stripHtmlComments).join("\n")}`;
  console.info(`verdict comment for review ${reviewId.toString()}`);
  runGh(["pr", "comment", pullRequest.toString(), "--body", body]);
};
