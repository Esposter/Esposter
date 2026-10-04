import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { deleteVoiceState } from "#src/services/deleteVoiceState";
import { defineCommand } from "citty";

export const teardownCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Teardown },
  run: async () => {
    const { strings } = await readGenshinContext();
    await deleteVoiceState();
    console.log(strings.teardownDone);
  },
});
