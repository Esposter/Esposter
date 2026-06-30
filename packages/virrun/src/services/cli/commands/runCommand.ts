import type { CommandDef } from "citty";

import { runPassthrough } from "@/services/cli/runPassthrough";
import { defineCommand } from "citty";
// `virrun run -- <cmd>` — the explicit form of the default passthrough: forks a warm snapshot on the os backend and
// Plain-execs on any other resolved backend. Identical to the bare `virrun -- <cmd>` prefix.
export const runCommand: CommandDef = defineCommand({
  meta: {
    description: "Run a command in the sandbox (forks a warm snapshot on the os backend, else execs natively).",
    name: "run",
  },
  run: ({ args, cmd }) => runPassthrough(args._, cmd, false),
});
