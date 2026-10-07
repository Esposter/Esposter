import type { SubCommandsDef } from "citty";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { formatPassValue } from "#src/services/genshinParity/passes/formatPassValue";
import { formatSkyComparison } from "#src/services/genshinParity/sky/formatSkyComparison";
import { readCloudStatistics } from "#src/services/genshinParity/sky/readCloudStatistics";
import { solveReferenceClouds } from "#src/services/genshinParity/sky/solveReferenceClouds";
import { toSkyReadings } from "#src/services/genshinParity/sky/toSkyReadings";
import { defineCommand } from "citty";

export const cloudsCommand: SubCommandsDef[string] = defineCommand({
  args: {
    reference: { description: "A reference's id in ParityReferenceMap", required: true, type: "positional" },
    witness: {
      description: "The component whose exports mark the sky's pixels",
      required: true,
      options: Object.values(DerivedAssetComponent),
      type: "enum",
    },
  },
  meta: {
    description:
      "The sky's clouds' lit and shaded colours solved by matching ours to the reference's by their colours' spread, where the two skies' clouds stand in different places, then both sets' cover, brightness, edge sharpness and spread",
    name: "clouds",
  },
  run: async ({ args }) => {
    const { lit, ourCount, referenceCount, residual, shade } = await solveReferenceClouds(args.reference, args.witness);
    console.log(`${ourCount} pixels of our clouds, ${referenceCount} of the reference's`);
    console.log(`lit ${lit}, shade ${shade}, residual ${residual.toFixed(4)} in scene colour`);
    // Where the clouds stand differs, so their kind is compared by their statistics
    const { distance, ours, reference, skyCount, spread } = await readCloudStatistics(args.reference, args.witness);
    console.log(`${skyCount} pixels of sky; ${formatSkyComparison(ours, reference)}`);
    for (const { gate, name, unit, value } of toSkyReadings(args.reference, distance, spread))
      console.log(`${name}: ${value.toFixed(4)} ${unit} against ${formatPassValue(gate)}`);
  },
});
