import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildQuests } from "#src/services/genshinText/buildQuests";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const questsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish every quest QuestId names to the game data: its steps, its talks and their words in every language",
    name: "quests",
  },
  run: async ({ args }) => {
    const { notes, objects } = buildQuests();
    for (const note of notes) console.log(note);
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.Quests, GameDataset.QuestText],
      }),
    );
  },
});
