import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildMiningOutcropPlaces } from "#src/services/genshinAssets/miningOutcrops/buildMiningOutcropPlaces";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const miningOutcropsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish each mining outcrop the official map marks as a Magical Crystal Chunk, placed by the fit, as one slice per region to the game data",
    name: "mining-outcrops",
  },
  run: async ({ args }) => {
    const { notes, objects } = await buildMiningOutcropPlaces();
    console.log(notes.join("\n"));
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.MiningOutcrops],
      }),
    );
  },
});
