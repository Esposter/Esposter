import { landQueue } from "#src/services/land/landQueue";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// `pnpm ai:land` — runs the precheck, then pulls and pushes this checkout's commits onto ai/queue, retrying a push the queue
// Moved past. A rebase conflict stops it with the rebase in progress, for the author to settle (the `review-queue` skill)
await runCommand(
  defineCommand({
    args: {
      remove: {
        default: false,
        description: "Remove this worktree and its branch once the commits have landed",
        type: "boolean",
      },
      "skip-precheck": {
        default: false,
        description: "Land without the precheck, for a change whose checks CI owns",
        type: "boolean",
      },
    },
    meta: {
      description:
        "Run the precheck, then pull and push this checkout's commits onto ai/queue; exits 0 landed, 1 precheck, 2 conflict, 3 no built configuration",
      name: "ai:land",
    },
    run: async ({ args }) => {
      process.exitCode = await landQueue(args.remove, args["skip-precheck"]);
    },
  }),
);
