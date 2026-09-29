import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { readNamedCharacter } from "#src/services/cli/readNamedCharacter";
import { switchSessionCharacter } from "#src/services/cli/switchSessionCharacter";
import { defineCommand } from "citty";

export const useCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Use },
  run: async ({ args }) => {
    const context = await readGenshinContext();
    const { sessionId, strings } = context;
    const name = args._.join(" ");
    const character = readNamedCharacter(context, name);
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
