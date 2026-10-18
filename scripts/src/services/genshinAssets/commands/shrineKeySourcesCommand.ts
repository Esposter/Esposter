import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildShrineKeySources } from "#src/services/genshinAssets/puzzles/buildShrineKeySources";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const shrineKeySourcesCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish each Shrine of Depths key a quest reward names in the dump, filed under the key's region, to the game data",
    name: "shrineKeySources",
  },
  run: async ({ args }) => {
    const { notes, objects } = buildShrineKeySources();
    console.log(notes.join("\n"));
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.ShrineKeySources],
      }),
    );
  },
});
