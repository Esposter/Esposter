import type { SubCommandsDef } from "citty";

import { publishLoginRecordings } from "#src/services/gameData/publishLoginRecordings";
import { dryRunArgs } from "#src/services/shared/dryRunArgs";
import { defineCommand } from "citty";

export const recordingsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the login's music recordings from their working folder to the game data, replacing the recordings the lock holds",
    name: "recordings",
  },
  run: async ({ args }) => {
    console.log(await publishLoginRecordings(args["dry-run"]));
  },
});
