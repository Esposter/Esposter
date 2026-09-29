import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { setMuted } from "#src/services/setMuted";
import { defineCommand } from "citty";

export const unmuteCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Unmute },
  run: async () => {
    const { strings } = await readGenshinContext();
    setMuted(false);
    console.log(strings.unmuted);
  },
});
