import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildWishSchedule } from "#src/services/genshinAssets/wish/buildWishSchedule";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const wishScheduleCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the event banners' windows and featured items, read from the wiki's wish pages and joined to the game's ids, to the game data",
    name: "wish-schedule",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: await buildWishSchedule() },
        scopes: [GameDataset.WishSchedule],
      }),
    );
  },
});
