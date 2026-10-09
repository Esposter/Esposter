import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildAchievements } from "#src/services/genshinAssets/achievements/buildAchievements";
import { buildAchievementText } from "#src/services/genshinAssets/achievements/buildAchievementText";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const achievementsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the achievements, their categories and every title and description in every language from the dump to the game data",
    name: "achievements",
  },
  run: async ({ args }) => {
    const { achievements, objects } = buildAchievements();
    const text = buildAchievementText(achievements);
    for (const note of text.notes) console.log(note);
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: { ...objects, ...text.objects } },
        scopes: [GameDataset.Achievements, GameDataset.AchievementText],
      }),
    );
  },
});
