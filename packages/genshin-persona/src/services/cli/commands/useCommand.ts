import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { findNamedCharacter } from "#src/services/cli/findNamedCharacter";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { switchSessionCharacter } from "#src/services/cli/switchSessionCharacter";
import { defineCommand } from "citty";

export const useCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Use },
  run: async ({ args }) => {
    const context = await readGenshinContext();
    const { sessionId, strings } = context;
    const name = args._.join(" ");
    const character = findNamedCharacter(context, name);
    if (!character) return;

    if (!sessionId) {
      console.error(strings.noSession);
      process.exitCode = 1;
      return;
    }

    await switchSessionCharacter(context, character);
    console.log(strings.usingInSession);
  },
});
