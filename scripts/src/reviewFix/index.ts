import { readReviewIssueFindings } from "#src/services/review/readReviewIssueFindings";
import { runReviewFix } from "#src/services/review/runReviewFix";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// `pnpm -C scripts ai:review:fix --findings <path>` — the fixer over one review issue's findings, the file `ai:review` wrote
// For that issue (`services/review`). Its commits land on `ai/queue` from this checkout, and the issue is narrowed or closed.
await runCommand(
  defineCommand({
    args: {
      findings: { description: "The findings file the review run wrote for one issue", required: true, type: "string" },
    },
    meta: {
      description: "Fix the findings the review wrote for one issue, and land the fixes on ai/queue",
      name: "review-fix",
    },
    run: async ({ args }) => {
      await runReviewFix(readReviewIssueFindings(args.findings));
    },
  }),
);
