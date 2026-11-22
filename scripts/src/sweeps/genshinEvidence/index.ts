import { readOpenGenshinDesigns } from "#src/services/sweeps/genshinEvidence/readOpenGenshinDesigns";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

await runCommand(
  defineCommand({
    meta: {
      description: "Print each genshin spec design that either genshin-evidence test opens",
      name: "ai:sweep:genshin-evidence",
    },
    run: () => {
      for (const path of readOpenGenshinDesigns()) console.info(path);
    },
  }),
);
