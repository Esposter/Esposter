import type { SubCommandsDef } from "citty";

import { CommandType } from "#src/models/virrun/CommandType";
import { listCaches } from "#src/services/cli/cache/listCaches";
import { defineCommand } from "citty";

export const cacheLsCommand: SubCommandsDef[string] = defineCommand({
  meta: { description: "List the repo-local dependency store and host-global warm snapshots.", name: CommandType.Ls },
  run: () => {
    listCaches();
  },
});
