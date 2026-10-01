import type { SubCommandsDef } from "citty";

import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { solveReferenceLight } from "#src/services/genshinParity/solveReferenceLight";
import { defineCommand } from "citty";

const format = (share: number[]): string => share.map((value) => value.toFixed(3)).join(", ");

export const lightCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    witness: {
      description: "The component whose exports mark the parts and their faces",
      required: true,
      type: "string",
    },
  },
  meta: {
    description:
      "Solve how strong the sun and the sky's ambient light should stand, as shares of the scene's, from the parts' lit and shaded faces",
    name: "light",
  },
  run: async ({ args }) => {
    const { ambientShare, litCount, shadeCount, sun, sunShare } = await solveReferenceLight(
      args.reference,
      parseDerivedAssetComponent(args.witness),
    );
    console.log(`sun times ${format(sunShare)}, ambient times ${format(ambientShare)}`);
    console.log(`over ${litCount} lit and ${shadeCount} shaded pixels of the parts`);
    console.log(
      `sun from heading ${sun.heading.toFixed(1)} and elevation ${sun.elevation.toFixed(1)}, toward ${sun.direction.map((value) => value.toFixed(3)).join(", ")}, residual ${sun.residual.toFixed(4)} against ${sun.gridResidual.toFixed(4)} over the grid`,
    );
  },
});
