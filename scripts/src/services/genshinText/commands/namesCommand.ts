import type { SubCommandsDef } from "citty";

import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildNames } from "#src/services/genshinText/buildNames";
import { dryRunArgs } from "#src/services/shared/dryRunArgs";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const namesCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description: "Publish every name the world's data cites, in every language, to the game data",
    name: "names",
  },
  run: async ({ args }) => {
    const { notes, objects } = await buildNames();
    for (const note of notes) console.log(note);
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.NameText],
      }),
    );
  },
});
