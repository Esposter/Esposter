import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { solveReferenceSky } from "#src/services/genshinParity/sky/solveReferenceSky";
import { parseNames } from "#src/services/shared/parseNames";
import { defineCommand } from "citty";

export const skyCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: {
      description: "References' ids in ParityReferenceMap at one hour, separated by commas",
      required: true,
      type: "positional",
    },
    witness: {
      description: "The component whose exports the witness draws",
      required: true,
      options: Object.values(DerivedAssetComponent),
      type: "enum",
    },
  },
  meta: {
    description:
      "Solve an hour's sky as the game's sky shader draws it over every reference given: its colours by least squares, its shape refined around them",
    name: "sky",
  },
  run: async ({ args }) => {
    const { colors, fullResidual, kept, references, residual, shape } = await solveReferenceSky(
      parseNames(args.reference, "reference"),
      args.witness,
    );
    for (const [term, color] of Object.entries(colors)) console.log(`${term}: ${color}`);
    console.log(
      Object.entries(shape)
        .map(([key, value]) => `${key} ${value.toFixed(3)}`)
        .join(", "),
    );
    console.log(
      `residual ${residual.toFixed(4)} as the screen shows it over the ${(kept * 100).toFixed(0)}% of the clear sky within its spread, ${fullResidual.toFixed(4)} over all of it`,
    );
    for (const { drawn, imagePath, referenceId } of references) {
      console.log(
        `${referenceId}: the scene's own sky without clouds stands ${drawn.residual.toFixed(4)} off the reference over the pixels read, its mean ${drawn.ours} against ${drawn.reference}, and ${drawn.modelResidual.toFixed(4)} off the solved sky, naught when the scene draws what the solve models`,
      );
      console.log(`  ${imagePath}`);
    }
  },
});
