import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildMaterialSourcePlaces } from "#src/services/genshinAssets/materialSources/buildMaterialSourcePlaces";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const materialSourcesCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish each crystalfly the official map marks, which gives its item when picked, as one slice per region to the game data",
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
