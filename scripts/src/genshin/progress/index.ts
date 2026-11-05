import { buildGenshinProgress } from "#src/services/genshinProgress/buildGenshinProgress";
import { formatGenshinProgress } from "#src/services/genshinProgress/formatGenshinProgress";
import { readGenshinUnits } from "#src/services/genshinProgress/readGenshinUnits";
import { readRunnableCapabilities } from "#src/services/genshinProgress/readRunnableCapabilities";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// `pnpm ai:genshin:progress` — every phase's units by kind: the compute areas, the changes by their open tasks and the
// Roadmap items, each done, runnable on this machine, waiting on a named blocker or blocked on the other machine. It reads
// The working tree and writes nothing (the `genshin-phases` change, "The progress report")
await runCommand(
  defineCommand({
    meta: {
      description: "Print each Genshin phase's units by kind as done, runnable here, waiting or blocked",
      name: "progress",
    },
    run: async () => {
      const capabilities = readRunnableCapabilities();
      const progress = buildGenshinProgress(readGenshinUnits(), await capabilities);
      for (const line of formatGenshinProgress(progress)) console.info(line);
    },
  }),
);
