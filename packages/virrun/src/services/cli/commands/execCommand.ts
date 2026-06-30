import type { CommandDef } from "citty";

import { CommandType } from "@/models/virrun/CommandType";
import { ExecutionMode } from "@/models/virrun/ExecutionMode";
import { runPassthrough } from "@/services/cli/runPassthrough";
import { defineCommand } from "citty";
// `virrun exec -- <cmd>` — forced plain exec: runs the command directly through the resolved backend with no
// Snapshot reuse and no write-back, even on the os backend. The cold sibling of `run`, for debugging a run without
// Warm-fork.
export const execCommand: CommandDef = defineCommand({
  meta: {
    description: "Exec a command directly through the resolved backend, skipping any warm-snapshot fork.",
    name: CommandType.Exec,
  },
  run: ({ args, cmd }) => runPassthrough(args._, cmd, ExecutionMode.Exec),
});
