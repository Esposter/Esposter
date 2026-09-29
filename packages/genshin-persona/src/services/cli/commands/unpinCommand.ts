import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { switchSessionCharacter } from "#src/services/cli/switchSessionCharacter";
import { deletePin } from "#src/services/deletePin";
import { pickCurrentCharacter } from "#src/services/pickCurrentCharacter";
import { defineCommand } from "citty";

export const unpinCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Unpin },
  run: async () => {
    const context = await readGenshinContext();
    const { roster, sessionId, strings, today } = context;
    deletePin();
    const pick = sessionId ? await pickCurrentCharacter(roster, today) : undefined;
    if (!pick) {
      console.log(strings.pinRemoved);
      return;
    }

    if (pick.loreFailure) console.log(strings.lorePickUnanswered(pick.loreFailure));
    await switchSessionCharacter(context, pick.character);
    console.log(strings.pinRemovedInSession);
  },
});
