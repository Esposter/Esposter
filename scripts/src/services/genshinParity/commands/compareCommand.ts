import type { ParityScore } from "#src/models/genshinParity/ParityScore";
import type { SubCommandsDef } from "citty";

import { compareScreen } from "#src/services/genshinParity/compareScreen";
import { ParityReferenceMap } from "#src/services/genshinParity/ParityReferenceMap";
import { writeParityScores } from "#src/services/genshinParity/writeParityScores";
import { defineCommand } from "citty";

export const compareCommand: SubCommandsDef[string] = defineCommand({
  args: {
    all: { description: "Compare every reference in turn", type: "boolean" },
    reference: { description: "A reference's id in ParityReferenceMap", required: false, type: "positional" },
  },
  meta: {
    description:
      "Shoot a reference's screen, print the scores, write reference, ours and difference, and update its row of the report",
    name: "compare",
  },
  run: async ({ args }) => {
    const referenceIds = args.all ? Object.keys(ParityReferenceMap) : [args.reference ?? ""];
    const scores: Record<string, ParityScore> = {};
    // One screen is shot at a time, on the one parity page
    for (const referenceId of referenceIds) {
      if (args.all) console.log(`== ${referenceId}`);
      // oxlint-disable-next-line no-await-in-loop -- the parity page shoots one screen at a time
      scores[referenceId] = await compareScreen(referenceId);
    }
    await writeParityScores(scores);
  },
});
