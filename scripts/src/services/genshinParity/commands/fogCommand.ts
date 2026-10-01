import type { SubCommandsDef } from "citty";

import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { solveReferenceFog } from "#src/services/genshinParity/solveReferenceFog";
import { defineCommand } from "citty";

const format = (share: number[]): string => share.map((value) => value.toFixed(3)).join(",");

export const fogCommand: SubCommandsDef[string] = defineCommand({
  args: {
    light: {
      description:
        "Solve each light's share of its strength per channel with the haze, from ours under the sun alone and the sky alone",
      type: "boolean",
    },
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    witness: {
      description: "The component whose exports mark the parts and their depths",
      required: true,
      type: "string",
    },
  },
  meta: {
    description:
      "The haze's density and its own and sunward colours solved over the parts' pixels, and with --light each light's share, toward the fog's own direction and the sky's sun, each with its residual",
    name: "fog",
  },
  run: async ({ args }) => {
    const { count, solutions } = await solveReferenceFog(args.reference, parseDerivedAssetComponent(args.witness), {
      isLightSolved: args.light,
    });
    console.log(`${count} pixels of the parts past the fog's start`);
    for (const { color, density, direction, residual, scatterColor, shares } of solutions)
      console.log(
        `toward ${direction}: density ${density.toFixed(4)}, colour ${color}, sunward ${scatterColor}${shares.length > 0 ? `, sun ${format(shares[0] ?? [])}, sky ${format(shares[1] ?? [])}` : ""}, residual ${residual.toFixed(4)}`,
      );
  },
});
