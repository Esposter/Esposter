import type { SubCommandsDef } from "citty";

import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildMaterialSourcePlaces } from "#src/services/genshinAssets/materialSources/buildMaterialSourcePlaces";
import { dryRunArgs } from "#src/services/shared/dryRunArgs";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const materialSourcesCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish each critter the official map marks under Animals that gives its item when picked, as one slice per region to the game data",
    name: "materialSources",
  },
  run: async ({ args }) => {
    const { notes, objects } = await buildMaterialSourcePlaces();
    console.log(notes.join("\n"));
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.MaterialSources],
      }),
    );
  },
});
