import { runReviewSettle } from "#src/services/review/runReviewSettle";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// `pnpm -C scripts ai:review:settle` — settles every open review issue, one settler session each, and lands what they
// Commit on `ai/queue` (`services/review`). The Review workflow's settle job runs it once every fix has finished.
await runCommand(
  defineCommand({
    meta: {
      description: "Settle every open review issue: fix, refute or record each finding, then close the issue",
      name: "review-settle",
    },
    run: async () => {
      await runReviewSettle();
    },
  }),
);
