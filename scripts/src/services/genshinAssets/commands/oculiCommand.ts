import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildOculusPlaces } from "#src/services/genshinAssets/oculi/buildOculusPlaces";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const oculiCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish each Oculus the official map marks, carried into the scene by the fit, as one slice per region to the game data",
    name: "oculi",
  },
  run: async ({ args }) => {
    const { notes, objects } = await buildOculusPlaces();
    console.log(notes.join("\n"));
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.Oculi],
      }),
    );
  },
});
