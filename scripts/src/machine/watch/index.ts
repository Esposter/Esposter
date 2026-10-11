import { watchMachine } from "#src/services/machine/watchMachine";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// `pnpm ai:machine:watch` — the machine's state, kept running by the genshin-mods pulse mod on Windows and macOS alike
// (the throughput skill, `references/machine-efficiency.md`)
await runCommand(
  defineCommand({
    meta: {
      description:
        "Print one line when the machine goes idle or tight, and sweep the orphaned searches it leaves behind",
      name: "watch",
    },
    run: watchMachine,
  }),
);
