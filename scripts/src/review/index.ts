import { runReview } from "#src/services/review/runReview";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// `pnpm -C scripts ai:review [--from <sha> --to <sha>] [--dry-run]` — plans every window of what `ai/queue` holds past
// `main`, or the range given, reviews all their batches in one pool with haiku reviewers, and advances `main` through the
// Passed prefix as it grows, opening each passed window's review issues (`services/review`). With `--findings-directory`,
// Each issue's findings are written as `issue-<number>.json` for `ai:review:fix`. `--dry-run` prints every window and its
// Batches, and runs no session and pushes nothing.
await runCommand(
  defineCommand({
    args: {
      "dry-run": {
        default: false,
        description: "Print every window and its batches, and run no session and push nothing",
        type: "boolean",
      },
      "findings-directory": {
        default: "",
        description: "The directory each issue's findings are written to, as issue-<number>.json; empty writes none",
        type: "string",
      },
      from: {
        default: "",
        description: "The sha a range review starts after, with --to; the steady mode when both are empty",
        type: "string",
      },
      to: { default: "", description: "The sha a range review ends at, with --from", type: "string" },
    },
    meta: {
      description:
        "Review what ai/queue holds past main in amount-capped windows, and advance main through the passed ones",
      name: "review",
    },
    run: async ({ args }) => {
      await runReview({
        findingsDirectory: args["findings-directory"],
        from: args.from,
        isDryRun: args["dry-run"],
        to: args.to,
      });
    },
  }),
);
