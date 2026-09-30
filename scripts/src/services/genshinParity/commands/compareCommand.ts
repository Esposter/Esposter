import type { SubCommandsDef } from "citty";

import { compareScreen } from "#src/services/genshinParity/compareScreen";
import { defineCommand } from "citty";

export const compareCommand: SubCommandsDef[string] = defineCommand({
  args: { reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" } },
  meta: {
    description: "Shoot a reference's screen, then print the scores and write reference, ours and difference",
    name: "compare",
  },
  run: ({ args }) => compareScreen(args.reference),
});
