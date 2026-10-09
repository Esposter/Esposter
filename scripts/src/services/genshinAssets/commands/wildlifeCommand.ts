import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildWildlifePlaces } from "#src/services/genshinAssets/wildlife/buildWildlifePlaces";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const wildlifeCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish each bird and beast the official map marks as a fleeing kind, carried into the scene by the fit, as one slice per region to the game data",
    name: "wildlife",
  },
  run: async ({ args }) => {
    const { notes, objects } = await buildWildlifePlaces();
    console.log(notes.join("\n"));
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.Wildlife],
      }),
    );
  },
});
