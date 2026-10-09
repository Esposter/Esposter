import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildGcgText } from "#src/services/genshinText/buildGcgText";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const gcgTextCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description: "Publish every name and description the card game's opponent decks name, in every language",
    name: "gcg",
  },
  run: async ({ args }) => {
    const { notes, objects } = await buildGcgText();
    for (const note of notes) console.log(note);
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.GcgText],
      }),
    );
  },
});
