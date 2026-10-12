import { readReviewWindowFindings } from "#src/services/review/readReviewWindowFindings";
import { runReviewFix } from "#src/services/review/runReviewFix";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// `pnpm -C scripts ai:review:fix --findings <path>` — the fixer over one window's findings, the file `ai:review` wrote for
// That window (`services/review`). Its commits land on `ai/queue` from this checkout, and what it defers is filed as one issue.
await runCommand(
  defineCommand({
    args: {
      findings: {
        description: "The findings file the review run wrote for one window",
        required: true,
        type: "string",
      },
    },
    meta: {
      description: "Fix the findings the review wrote for one window, and land the fixes on ai/queue",
      name: "review-fix",
    },
    run: async ({ args }) => {
      await runReviewFix(readReviewWindowFindings(args.findings));
    },
  }),
);
