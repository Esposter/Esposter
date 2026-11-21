import { readKitDesignPaths } from "#src/services/sweeps/kitDesign/readKitDesignPaths";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// Prints the design file a kit resolves to, one line per file, and nothing when no folder bears its name or a word of
// It. The kit-differs-from-source pass reads that design against the kit's overlay.
await runCommand(
  defineCommand({
    args: {
      kit: {
        description: "The kit's name as its overlay names it, e.g. arataki-itto",
        required: true,
        type: "positional",
      },
    },
    meta: {
      description: "Print the design file a genshin kit resolves to, by its name or a word of its name",
      name: "ai:sweep:kit-design",
    },
    run: ({ args }) => {
      for (const path of readKitDesignPaths(args.kit)) console.info(path);
    },
  }),
);
