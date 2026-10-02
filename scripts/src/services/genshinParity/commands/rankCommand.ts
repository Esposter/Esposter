import type { SubCommandsDef } from "citty";

import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { readStandInGains } from "#src/services/genshinParity/readStandInGains";
import { rankReferenceGains } from "#src/services/genshinParity/rankReferenceGains";
import { defineCommand } from "citty";

export const rankCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    witness: {
      description: "The component whose exports mark the layers and stand beside our parts",
      required: true,
      type: "string",
    },
  },
  meta: {
    description:
      "Every term of a reference's error ranked by its ceiling, the most of the frame's FLIP it could recover: each family's stand-in apart from its light, haze and grade by depth, and the sky by rows",
    name: "rank",
  },
  run: async ({ args }) => {
    const { frame, terms } = await rankReferenceGains(args.reference, parseDerivedAssetComponent(args.witness));
    console.log(`frame FLIP ${frame.toFixed(4)}, each term's ceiling the most of it that term could recover:`);
    for (const { ceiling, name, share } of terms)
      console.log(`${ceiling.toFixed(4)}  ${name} (${(share * 100).toFixed(1)}% of the frame)`);
    // A recording hides what a stand-in lacks, so each is ranked again against the game's own exports drawn beside it
    const standIns = await readStandInGains(args.reference, parseDerivedAssetComponent(args.witness));
    console.log("each stand-in against the game's own exports at the same camera, moment and light, ceiling first:");
    for (const { ceiling, mean, name, share } of standIns)
      console.log(
        `${ceiling.toFixed(4)}  ${name}: FLIP ${mean.toFixed(4)} over ${(share * 100).toFixed(1)}% of the frame`,
      );
  },
});
