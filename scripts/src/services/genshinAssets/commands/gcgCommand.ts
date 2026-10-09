import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildGcgDeck } from "#src/services/genshinAssets/gcg/buildGcgDeck";
import { buildGcgGames } from "#src/services/genshinAssets/gcg/buildGcgGames";
import { buildGcgStandardRule } from "#src/services/genshinAssets/gcg/buildGcgStandardRule";
import { GcgDeckIdCreatedCardIdsMap } from "#src/services/genshinAssets/gcg/constants";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const gcgCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the standard duel rule, the opponent decks and the duels' games from the dump to the game data",
    name: "gcg",
  },
  run: async ({ args }) => {
    const builtObjects: Record<string, unknown>[] = [
      buildGcgStandardRule(),
      buildGcgGames(),
      ...Array.from(GcgDeckIdCreatedCardIdsMap, ([deckId, createdCardIds]) => buildGcgDeck(deckId, createdCardIds)),
    ];
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: {
          indexes: {},
          objects: Object.fromEntries(builtObjects.flatMap((objects) => Object.entries(objects))),
        },
        scopes: [GameDataset.Gcg],
      }),
    );
  },
});
