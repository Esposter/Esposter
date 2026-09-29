import type { SubCommandsDef } from "citty";

import { GenshinVerb } from "#src/models/GenshinVerb";
import { getStatusReport } from "#src/services/cli/getStatusReport";
import { readGenshinContext } from "#src/services/cli/readGenshinContext";
import { defineCommand } from "citty";

export const statusCommand: SubCommandsDef[string] = defineCommand({
  meta: { name: GenshinVerb.Status },
  run: async () => {
    const context = await readGenshinContext();
    const { strings } = context;
    console.log(strings.status(await getStatusReport(context)));
  },
});
