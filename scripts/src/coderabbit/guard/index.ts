import { runGuard } from "#src/services/coderabbit/guard/runGuard";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// `pnpm ai:coderabbit:guard` — whether the review collector's guard wakes the cycle after a red or killed run
await runCommand(
  defineCommand({
    meta: {
      description: "Whether the review collector's guard wakes the cycle after a red or killed run",
      name: "ai:coderabbit:guard",
    },
    run: runGuard,
  }),
);
