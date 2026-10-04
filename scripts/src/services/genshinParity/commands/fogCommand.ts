import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";
import { solveReferenceFog } from "#src/services/genshinParity/solveReferenceFog";
import { defineCommand } from "citty";

export const fogCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    witness: {
      description: "The component whose exports mark the parts and their depths",
      required: true,
      options: Object.values(DerivedAssetComponent),
      type: "enum",
    },
  },
  meta: {
    description:
      "The haze's density and its own and sunward colours solved over the parts' pixels, toward the fog's own direction and the sky's sun, each with its residual",
    name: "fog",
  },
  run: async ({ args }) => {
    const { count, solutions } = await solveReferenceFog(args.reference, args.witness);
    console.log(`${count} pixels of the parts past the fog's start`);
    for (const { color, density, direction, residual, scatterColor } of solutions)
      console.log(
        `toward ${direction}: density ${density.toFixed(4)}, colour ${color}, sunward ${scatterColor}, residual ${residual.toFixed(4)}`,
      );
  },
});
