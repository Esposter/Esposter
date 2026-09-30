import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { printCard } from "#src/services/cli/printCard";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { readNamedCharacter } from "#src/services/cli/readNamedCharacter";
import { switchSessionCharacter } from "#src/services/cli/switchSessionCharacter";
import { readPersonaCard } from "#src/services/readPersonaCard";
import { writePin } from "#src/services/writePin";
import { writeSessionSpinner } from "#src/services/writeSessionSpinner";
import { defineCommand } from "citty";

export const pinCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Pin },
  run: async ({ args }) => {
    const context = await readGenshinContext();
    const { language, sessionId, strings } = context;
    const name = args._.join(" ");
    const pinnedCharacter = readNamedCharacter(context, name);
    if (!pinnedCharacter) return;

    writePin(pinnedCharacter);
    // The pinned character is what every later session speaks as, so the spinner may follow where `setup` opted it in
    await writeSessionSpinner(pinnedCharacter, await readPersonaCard(pinnedCharacter.name), language);
    if (sessionId) {
      await switchSessionCharacter(context, pinnedCharacter);
      console.log(strings.pinnedInSession);
      return;
    }

    await printCard(context, pinnedCharacter);
    console.log(strings.pinned);
  },
});
