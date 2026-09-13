import type { DrainPromptInput } from "#src/models/coderabbit/collect/DrainPromptInput";

import { getMarker } from "#src/services/coderabbit/collect/checkHasMarkerComment";
import { DRAINS_MARKER } from "#src/services/coderabbit/collect/constants";
import { runGh } from "#src/services/coderabbit/shared/runGh";
import { getNonEmptyLines } from "#src/services/getNonEmptyLines";
import { existsSync, readFileSync } from "node:fs";

// The drain's half of the reply, posted by the only process that holds a credential. A rejection is answered
// The moment the drain ends — it cites no sha, so nothing waits for the push — while an accepted finding's
// Reply is `replyAnswered`'s, after the window lands on `develop`.
const readLines = (path: string): string[] => (existsSync(path) ? getNonEmptyLines(readFileSync(path, "utf8")) : []);

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

    const body = `Not a real issue, no change — ${reason.join(" ")}`;
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

  const body = `${getMarker(DRAINS_MARKER, reviewId)}\nBody-only findings of review ${reviewId.toString()} are rejected:\n${verdicts.join("\n")}`;
  console.info(`verdict comment for review ${reviewId.toString()}`);
  runGh(["pr", "comment", pullRequest.toString(), "--body", body]);
};
