import type { SubCommandsDef } from "citty";

import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { readReferenceExposure } from "#src/services/genshinParity/readReferenceExposure";
import { defineCommand } from "citty";

export const exposureCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    witness: { description: "The component whose exports mark the parts' pixels", required: true, type: "string" },
  },
  meta: {
    description:
      "How much brighter a reference's parts stand than ours, as the median linear luminance over the parts' pixels",
    name: "exposure",
  },
  run: async ({ args }) => {
    const { ours, ratio, reference } = await readReferenceExposure(
      args.reference,
      parseDerivedAssetComponent(args.witness),
    );
    console.log(`reference ${reference.toFixed(4)}, ours ${ours.toFixed(4)}: the light times ${ratio.toFixed(3)}`);
  },
});
