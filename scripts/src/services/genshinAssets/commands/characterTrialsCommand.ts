import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildTrials } from "#src/services/genshinAssets/trials/buildTrials";
import { readCharacterTrialsInput } from "#src/services/genshinAssets/trials/readCharacterTrialsInput";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const characterTrialsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the character trials' stages, the trial avatars at their levels, the reliquaries and templates they wear, and the items each stage's first-clear reward pays, from the trial tables of the dump",
    name: "character-trials",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: buildTrials(readCharacterTrialsInput()) },
        scopes: [GameDataset.CharacterTrials],
      }),
    );
  },
});
