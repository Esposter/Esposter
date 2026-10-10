import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildProfilePublication } from "#src/services/genshinAssets/profile/buildProfilePublication";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const profileCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description: "Publish each playable character's Profile tab from the dump to the game data, in every language",
    name: "profile",
  },
  run: async ({ args }) => {
    const { note, publication } = buildProfilePublication();
    console.log(note);
    console.log(await publishGameDataStep({ isDryRun: args["dry-run"], publication, scopes: [GameDataset.Profile] }));
  },
});
