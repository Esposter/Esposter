import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { setMuted } from "#src/services/setMuted";
import { defineCommand } from "citty";

export const muteCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Mute },
  run: async () => {
    const { strings } = await readGenshinContext();
    setMuted(true);
    console.log(strings.muted);
  },
});
