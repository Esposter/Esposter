import type { CommandDef } from "citty";

import { CommandType } from "@/models/virrun/CommandType";
import { ExecutionMode } from "@/models/virrun/ExecutionMode";
import { runPassthrough } from "@/services/cli/runPassthrough";
import { defineCommand } from "citty";
// Forced plain exec: no snapshot reuse and no write-back even on the os backend — the cold sibling of `run`.
export const execCommand: CommandDef = defineCommand({
  meta: {
    description: "Exec a command directly through the resolved backend, skipping any warm-snapshot fork.",
    name: CommandType.Exec,
  },
  run: ({ args, cmd }) => runPassthrough(args._, cmd, ExecutionMode.Exec),
});
