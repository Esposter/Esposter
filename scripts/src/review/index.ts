import { runReview } from "#src/services/review/runReview";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// `pnpm -C scripts ai:review [--from <sha> --to <sha>] [--dry-run]` — reviews what `ai/queue` holds past `main` in
// amount-capped windows, or the range given, with haiku reviewers and one fixer (`services/review`). `--dry-run` prints
// the window, its base and end, and its batches, and runs no session and pushes nothing.
await runCommand(
  defineCommand({
    args: {
      "dry-run": {
        default: false,
        description: "Print the window and its batches, and run no session and push nothing",
        type: "boolean",
      },
      from: {
        default: "",
        description: "The sha a range review starts after, with --to; the steady mode when both are empty",
        type: "string",
      },
      to: { default: "", description: "The sha a range review ends at, with --from", type: "string" },
    },
    meta: {
      description: "Review what ai/queue holds past main in amount-capped windows, and fix what the reviewers find",
      name: "review",
    },
    run: async ({ args }) => {
      await runReview({ from: args.from, isDryRun: args["dry-run"], to: args.to });
    },
  }),
);
