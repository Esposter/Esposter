import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildStatTables } from "#src/services/genshinAssets/stats/buildStatTables";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const statsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the characters', weapons' and artifacts' attribute tables from the dump's game tables to the game data",
    name: "stats",
  },
  run: async ({ args }) => {
    const { notes, publication } = buildStatTables();
    for (const note of notes) console.log(note);
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication,
        scopes: [GameDataset.Stats, GameDataset.TalentMultipliers, GameDataset.TalentLabels],
      }),
    );
  },
});
