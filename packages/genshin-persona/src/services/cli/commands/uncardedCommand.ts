import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { printQueue } from "#src/services/cli/printQueue";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { defineCommand } from "citty";

export const uncardedCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Uncarded },
  run: async () => {
    const context = await readGenshinContext();
    await printQueue(context, ({ personaCard }) => !personaCard);
  },
});
