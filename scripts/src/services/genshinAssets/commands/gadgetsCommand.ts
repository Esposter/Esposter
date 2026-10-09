import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildGadgetRows } from "#src/services/genshinAssets/gadgets/buildGadgetRows";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const gadgetsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the gadgets the widget config builds (their kind, cooldowns and cooldown group) from the dump to the game data",
    name: "gadgets",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: buildGadgetRows() },
        scopes: [GameDataset.Gadgets],
      }),
    );
  },
});
