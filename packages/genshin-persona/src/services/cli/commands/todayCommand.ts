import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { getCurrentCharacter } from "#src/services/cli/getCurrentCharacter";
import { printCard } from "#src/services/cli/printCard";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { defineCommand } from "citty";

export const todayCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Today },
  run: async () => {
    const context = await readGenshinContext();
    const character = await getCurrentCharacter(context);
    if (character) await printCard(context, character);
  },
});
