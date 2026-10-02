import type { SubCommandsDef } from "citty";

import { parseDerivedAssetComponent } from "#src/services/genshinAssets/parseDerivedAssetComponent";
import { readCloudStatistics } from "#src/services/genshinParity/readCloudStatistics";
import { solveReferenceClouds } from "#src/services/genshinParity/solveReferenceClouds";
import { defineCommand } from "citty";

export const cloudsCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    witness: { description: "The component whose exports mark the sky's pixels", required: true, type: "string" },
  },
  meta: {
    description:
      "The sky's clouds' lit and shaded colours solved by matching ours to the reference's by their colours' spread, where the two skies' clouds stand in different places, then both sets' cover, brightness, edge sharpness and spread",
    name: "clouds",
  },
  run: async ({ args }) => {
    const { lit, ourCount, referenceCount, residual, shade } = await solveReferenceClouds(
      args.reference,
      parseDerivedAssetComponent(args.witness),
    );
    console.log(`${ourCount} pixels of our clouds, ${referenceCount} of the reference's`);
    console.log(`lit ${lit}, shade ${shade}, residual ${residual.toFixed(4)} in scene colour`);
    // Where the clouds stand differs, so their kind is compared by their statistics
    const { ours, reference } = await readCloudStatistics(args.reference, parseDerivedAssetComponent(args.witness));
    for (const [name, { contrast, coverage, edgeSharpness, spread }] of Object.entries({ ours, reference }))
      console.log(
        `${name}: cover ${(coverage * 100).toFixed(1)}% of the sky, ${contrast.toFixed(2)} times its brightness, edge sharpness ${edgeSharpness.toFixed(3)}, spread ${spread.toFixed(3)}`,
      );
  },
});
