import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildFrostbearingTreeLevels } from "#src/services/genshinAssets/offerings/buildFrostbearingTreeLevels";
import { buildFrostbearingTreePlaces } from "#src/services/genshinAssets/offerings/buildFrostbearingTreePlaces";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const offeringsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the Frostbearing Tree's levels (the items each takes, its rewards) from the dump, and its place from the official map, to the game data",
    name: "offerings",
  },
  run: async ({ args }) => {
    const levels = buildFrostbearingTreeLevels();
    const { notes, objects } = await buildFrostbearingTreePlaces();
    console.log(notes.join("\n"));
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: { ...levels, ...objects } },
        scopes: [GameDataset.Offerings, GameDataset.FrostbearingTreePlaces],
      }),
    );
  },
});
