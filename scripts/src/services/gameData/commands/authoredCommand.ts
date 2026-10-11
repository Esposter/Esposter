import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishObjectsStep } from "#src/services/gameData/publishObjectsStep";
import { readAuthoredGameData } from "#src/services/gameData/readAuthoredGameData";
import { defineCommand } from "citty";

export const authoredCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the world's authored data files, which no step generates, from their committed sources to the game data",
    name: "authored",
  },
  run: async ({ args }) => {
    const objects = await readAuthoredGameData();
    // Each file is its own key, so a ground a fit publishes, Windrise's among them, is kept beside the authored ones
    console.log(await publishObjectsStep({ isDryRun: args["dry-run"], objects }));
  },
});
