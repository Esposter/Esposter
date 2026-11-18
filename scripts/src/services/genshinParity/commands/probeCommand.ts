import type { SubCommandsDef } from "citty";

import { ProbeSide } from "#src/models/genshinParity/probe/ProbeSide";
import { readRegionArgs } from "#src/services/genshinParity/commands/readRegionArgs";
import { regionArgs } from "#src/services/genshinParity/commands/regionArgs";
import { probeRectangle } from "#src/services/genshinParity/probe/probeRectangle";
import { defineCommand } from "citty";

export const probeCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    ...regionArgs,
    side: {
      default: ProbeSide.Both,
      description: "Which side to read: the reference, our last shot of its screen, or both",
      options: Object.values(ProbeSide),
      type: "enum",
    },
  },
  meta: {
    description:
      "A rectangle of a reference in its own pixels, read as JSON: its mean colour, the ink of each row and column, and the first strong edge from each side, beside the same of our last shot",
    name: "probe",
  },
  run: async ({ args }) => {
    console.log(JSON.stringify(await probeRectangle(args.reference, readRegionArgs(args), args.side)));
  },
});
