import type { SubCommandsDef } from "citty";

import { environmentArgs } from "#src/services/cutover/commands/environmentArgs";
import { runAssignIds } from "#src/services/cutover/ids/runAssignIds";
import { defineCommand } from "citty";

export const assignIdsCommand: SubCommandsDef[string] = defineCommand({
  args: environmentArgs,
  meta: {
    description:
      "Give every Postgres row its new UUIDv7 and every credential its re-issued token, kept in the archive. Before copy-objects, in the live copy and in the freeze",
    name: "assign-ids",
  },
  run: async ({ args }) => {
    await runAssignIds(args.environment);
  },
});
