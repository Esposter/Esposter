import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { rankReferenceGains } from "#src/services/genshinParity/witness/rankReferenceGains";
import { readStandInGains } from "#src/services/genshinParity/witness/readStandInGains";
import { defineCommand } from "citty";

export const rankCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    witness: {
      description: "The component whose exports mark the layers and stand beside our parts",
      required: true,
      options: Object.values(DerivedAssetComponent),
      type: "enum",
    },
  },
  meta: {
    description:
      "Every term of a reference's error ranked by its ceiling, the most of the frame's FLIP it could recover: each family's stand-in apart from its light, haze and grade by depth, and the sky by rows; then what a light constant over each binning of the parts could recover",
    name: "rank",
  },
  run: async ({ args }) => {
    const { frame, lightCeilings, terms } = await rankReferenceGains(args.reference, args.witness);
    console.log(`frame FLIP ${frame.toFixed(4)}, each term's ceiling the most of it that term could recover:`);
    for (const { ceiling, name, share } of terms)
      console.log(`${ceiling.toFixed(4)}  ${name} (${(share * 100).toFixed(1)}% of the frame)`);
    const standIns = await readStandInGains(args.reference, args.witness);
    console.log(
      "each stand-in's gap from the game's own exports drawn beside it, which picks its representation once the first table ranks it and orders nothing:",
    );
    for (const { gap, mean, name, share, similarity } of standIns)
      console.log(
        `${gap.toFixed(4)}  ${name}: FLIP ${mean.toFixed(4)}, similarity ${similarity.toFixed(4)} over ${(share * 100).toFixed(1)}% of the frame`,
      );
    console.log(
      `the exports' frame, FLIP ${lightCeilings.drawn.toFixed(4)}, corrected to the reference's own colour over each bin of its parts, the most any light constant over those bins could recover:`,
    );
    for (const { frame: corrected, name } of lightCeilings.rows)
      console.log(`${(lightCeilings.drawn - corrected).toFixed(4)}  ${name}: FLIP ${corrected.toFixed(4)}`);
  },
});
