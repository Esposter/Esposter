import type { SubCommandsDef } from "citty";

import { PaletteRegion } from "#src/models/genshinAssets/palette/PaletteRegion";
import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { toGameDataKeyScopes } from "#src/services/gameData/toGameDataKeyScopes";
import { sampleRegionPalette } from "#src/services/genshinAssets/palette/sampleRegionPalette";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

export const paletteCommand: SubCommandsDef[string] = defineCommand({
  args: {
    region: {
      description: `The region to sample: ${Object.values(PaletteRegion).join(", ")}`,
      required: true,
      type: "positional",
    },
    ...dryRunArgs,
  },
  meta: {
    description:
      "Sample a region's kit colours from the diffuse textures of its building families and publish them as the region's palette",
    name: "palette",
  },
  run: async ({ args }) => {
    const region = Object.values(PaletteRegion).find((value) => value === args.region);
    if (!region) throw new InvalidOperationError(Operation.Read, args.region, "is no palette region");
    const { notes, objects } = await sampleRegionPalette(region);
    for (const note of notes) console.log(note);
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: toGameDataKeyScopes(Object.keys(objects)),
      }),
    );
  },
});
