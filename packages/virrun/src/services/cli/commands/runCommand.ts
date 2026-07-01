import type { RunArgs } from "@/models/cli/RunArgs";
import type { ArgsDef, CommandDef } from "citty";

import { CommandType } from "@/models/virrun/CommandType";
import { ExecutionMode } from "@/models/virrun/ExecutionMode";
import { runPassthrough } from "@/services/cli/runPassthrough";
import { defineCommand } from "citty";
// Explicit annotation for isolatedDeclarations + `satisfies ArgsDef` to validate the literal.
const runArgs: RunArgs = {
  ephemeral: {
    default: false,
    description: "Discard the command's writes instead of persisting them to the host (verification/CI).",
    type: "boolean",
  },
} satisfies ArgsDef;
// `--ephemeral` keeps the warm fork but lets the command's writes vanish (CI/verification where no output is wanted)
// Instead of flushing them back to the host.
export const runCommand: CommandDef<RunArgs> = defineCommand({
  args: runArgs,
  meta: {
    description: "Run a command in the sandbox (warm snapshot; persists produced files to the host on the os backend).",
    name: CommandType.Run,
  },
  run: ({ args, cmd }) => runPassthrough(args._, cmd, args.ephemeral ? ExecutionMode.Fork : ExecutionMode.Persist),
});
