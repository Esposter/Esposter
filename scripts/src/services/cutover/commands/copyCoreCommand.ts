import type { SubCommandsDef } from "citty";

import { environmentArgs } from "#src/services/cutover/commands/environmentArgs";
import { runCopyCore } from "#src/services/cutover/core/runCopyCore";
import { defineCommand } from "citty";

export const copyCoreCommand: SubCommandsDef[string] = defineCommand({
  args: { ...environmentArgs },
  meta: {
    description: "Copy every Postgres table into D1 core in foreign-key order, then remove rows the source no longer holds",
    name: "copy-core",
  },
  run: async () => {
    await runCopyCore();
  },
});
