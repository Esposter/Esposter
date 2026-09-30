import type { SubCommandsDef } from "citty";

import { writeLine } from "#src/services/cli/writeLine";
import { SESSION_SUBCOMMAND } from "#src/services/drivers/window/constants";
import { runSessionChild } from "#src/services/drivers/window/runSessionChild";
import { defineCommand } from "citty";

// A session's window, started by the host it connects back to
export const sessionCommand: SubCommandsDef[string] = defineCommand({
  args: { port: { description: "The port of the host that started this window", required: true, type: "string" } },
  meta: {
    description: "Serve one session in a window of its own, for the host that started it",
    name: SESSION_SUBCOMMAND,
  },
  run: async ({ args }) => {
    await runSessionChild(Number(args.port), writeLine);
    process.exit(0);
  },
});
