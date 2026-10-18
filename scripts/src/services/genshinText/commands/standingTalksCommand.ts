import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildStandingTalks } from "#src/services/genshinText/buildStandingTalks";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const standingTalksCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the standing talk of every resident the regions' data places and the favour talk of every companion's gift set, and their words in every language",
    name: "standing-talks",
  },
  run: async ({ args }) => {
    const { notes, objects } = await buildStandingTalks();
    for (const note of notes) console.log(note);
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.StandingTalks, GameDataset.StandingTalkText],
      }),
    );
  },
});
