import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildFriendship } from "#src/services/genshinAssets/friendship/buildFriendship";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const friendshipCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the Friendship Levels (each level's total Companionship EXP) and the namecards from the dump to the game data",
    name: "friendship",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: buildFriendship() },
        scopes: [GameDataset.Friendship],
      }),
    );
  },
});
