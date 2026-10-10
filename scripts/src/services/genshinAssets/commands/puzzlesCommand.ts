import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildPuzzlePlaces } from "#src/services/genshinAssets/puzzles/buildPuzzlePlaces";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const puzzlesCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish each puzzle mechanism the official map marks, carried into the scene by the fit, as one slice per region to the game data",
    name: "puzzles",
  },
  run: async ({ args }) => {
    const { notes, objects } = await buildPuzzlePlaces();
    console.log(notes.join("\n"));
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.Puzzles],
      }),
    );
  },
});
