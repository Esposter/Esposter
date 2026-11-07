import type { SubCommandsDef } from "citty";

import { printStamps } from "#src/services/fleet/data/commands/printStamps";
import { readStdinLines } from "#src/services/fleet/data/commands/readStdinLines";
import { getParityDirectory } from "#src/services/fleet/data/getParityDirectory";
import { defineCommand } from "citty";

// `pnpm ai:fleet:data stamps` — the provenance stamps among the paths named on stdin, one JSON line each for those that exist
export const stampsCommand: SubCommandsDef[string] = defineCommand({
  args: { directory: { description: "The parity directory the stamp paths are under", type: "string" } },
  meta: { description: "Print the provenance stamps named on stdin that exist, as JSON lines", name: "stamps" },
  run: async ({ args }) => {
    await printStamps(args.directory || getParityDirectory(), await readStdinLines());
  },
});
