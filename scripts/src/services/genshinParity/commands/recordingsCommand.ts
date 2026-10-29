import type { SubCommandsDef } from "citty";

import { recordingsBackfillCommand } from "#src/services/genshinParity/commands/recordingsBackfillCommand";
import { defineCommand } from "citty";

export const recordingsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description: "Keep the public recordings in the captures folder as manifest rows, each fetched again by its id",
    name: "recordings",
  },
  subCommands: { backfill: recordingsBackfillCommand },
});
