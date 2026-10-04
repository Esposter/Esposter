import type { SubCommandsDef } from "citty";

import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { solveReferenceSky } from "#src/services/genshinParity/solveReferenceSky";
import { defineCommand } from "citty";

export const skyCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    witness: { description: "The component whose exports the witness draws", required: true, type: "string" },
  },
  meta: {
    description:
      "Solve a reference's sky as the game's sky shader draws it: its colours by least squares, its shape refined around them",
    name: "sky",
  },
  run: async ({ args }) => {
    const { colors, drawn, imagePath, kept, residual, shape } = await solveReferenceSky(
      args.reference,
      parseDerivedAssetComponent(args.witness),
    );
    for (const [term, color] of Object.entries(colors)) console.log(`${term}: ${color}`);
    console.log(
      Object.entries(shape)
        .map(([key, value]) => `${key} ${value.toFixed(3)}`)
        .join(", "),
    );
    console.log(
      `residual ${residual.toFixed(4)} in scene colour over the ${(kept * 100).toFixed(0)}% of the clear sky within its spread`,
    );
    console.log(
      `drawn: the scene's own sky without clouds stands ${drawn.residual.toFixed(4)} off the reference over the pixels read, its mean ${drawn.ours} against ${drawn.reference}`,
    );
    console.log(imagePath);
  },
});
