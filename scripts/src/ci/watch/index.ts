import { watchQueueRun } from "#src/services/ci/watchQueueRun";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// `pnpm ai:ci:watch` — run in the background after a push to `ai/queue`, it wakes the session with the verdict of the run
// Covering the tip, and each failed job's error lines (the `running-checks` skill, "Watching the push's run")
await runCommand(
  defineCommand({
    meta: {
      description:
        "Wait for the CI run covering ai/queue's tip and print its verdict; exits 1 on a red, 2 with no verdict",
      name: "watch",
    },
    run: async () => {
      const verdict = await watchQueueRun();
      if (verdict !== "pass") process.exitCode = verdict === "fail" ? 1 : 2;
    },
  }),
);
