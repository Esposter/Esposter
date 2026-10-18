import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildFrostbearingTreePlaces } from "#src/services/genshinAssets/offerings/buildFrostbearingTreePlaces";
import { buildOfferingLevels } from "#src/services/genshinAssets/offerings/buildOfferingLevels";
import { buildOfferingPlaces } from "#src/services/genshinAssets/offerings/buildOfferingPlaces";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const offeringsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish every offering's levels (the items each takes, its rewards) from the dump, and each offering's place from the official map, to the game data",
    name: "offerings",
  },
  run: async ({ args }) => {
    const levels = buildOfferingLevels();
    const frostbearingTree = await buildFrostbearingTreePlaces();
    const places = await buildOfferingPlaces();
    console.log([...levels.notes, ...frostbearingTree.notes, ...places.notes].join("\n"));
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: { ...levels.objects, ...frostbearingTree.objects, ...places.objects } },
        scopes: [GameDataset.Offerings, GameDataset.FrostbearingTreePlaces, GameDataset.OfferingPlaces],
      }),
    );
  },
});
