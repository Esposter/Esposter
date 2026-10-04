import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { findNamedCharacter } from "#src/services/cli/findNamedCharacter";
import { printCard } from "#src/services/cli/printCard";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { switchSessionCharacter } from "#src/services/cli/switchSessionCharacter";
import { writePin } from "#src/services/writePin";
import { defineCommand } from "citty";

export const pinCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Pin },
  run: async ({ args }) => {
    const context = await readGenshinContext();
    const { sessionId, strings } = context;
    const name = args._.join(" ");
    const pinnedCharacter = findNamedCharacter(context, name);
    if (!pinnedCharacter) return;

    writePin(pinnedCharacter);
    if (sessionId) {
      await switchSessionCharacter(context, pinnedCharacter);
      console.log(strings.pinnedInSession);
      return;
    }

    await printCard(context, pinnedCharacter);
    console.log(strings.pinned);
  },
});
