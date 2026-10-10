import { runGuard } from "#src/services/coderabbit/guard/runGuard";
import { defineCommand, runMain } from "citty";

// `pnpm ai:coderabbit:guard` — whether the review collector's guard wakes the cycle after a red or killed run
await runMain(
  defineCommand({
    meta: {
      description: "Whether the review collector's guard wakes the cycle after a red or killed run",
      name: "ai:coderabbit:guard",
    },
    run: runGuard,
  }),
);
