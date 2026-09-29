import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { getRosterLine } from "#src/services/cli/getRosterLine";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { defineCommand } from "citty";

export const rosterCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Roster },
  run: async () => {
    const { roster } = await readGenshinContext();
    for (const character of roster) console.log(getRosterLine(character));
  },
});
