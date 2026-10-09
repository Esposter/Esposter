import { watchMachine } from "#src/services/machine/watchMachine";
import { defineCommand, runMain } from "citty";

// `pnpm ai:machine:watch` — the machine's state for the session, run under Monitor on Windows and macOS alike
// (the throughput skill, `references/machine-efficiency.md`)
await runMain(
  defineCommand({
    meta: {
      description:
        "Print one line when the machine goes idle or tight, and sweep the orphaned searches it leaves behind",
      name: "watch",
    },
    run: watchMachine,
  }),
);
