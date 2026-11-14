import type { SubCommandsDef } from "citty";

import { environmentArgs } from "#src/services/cutover/commands/environmentArgs";
import { runCopyCore } from "#src/services/cutover/core/runCopyCore";
import { defineCommand } from "citty";

export const copyCoreCommand: SubCommandsDef[string] = defineCommand({
  args: { ...environmentArgs },
  meta: {
    description:
      "Copy every Postgres table into D1 core in foreign-key order, upserting, then remove the rows the source no longer holds, children first. Run live before copy-tables, and again in full inside the freeze before copy-tables --delta",
    name: "copy-core",
  },
  run: async ({ args }) => {
    await runCopyCore(args.environment);
  },
});
