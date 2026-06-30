import type { ArgsDef, CommandDef } from "citty";

import { ExecutionMode } from "@/models/virrun/ExecutionMode";
import { runPassthrough } from "@/services/cli/runPassthrough";
import { defineCommand } from "citty";
// Explicit annotation (what isolatedDeclarations emits for the exported `CommandDef<typeof runArgs>`; a
// Specific-args CommandDef is not assignable to the generic CommandDef) + `satisfies ArgsDef` to validate the
// Literal against citty's arg-definition shape.
const runArgs: { ephemeral: { default: boolean; description: string; type: "boolean" } } = {
  ephemeral: {
    default: false,
    description: "Discard the command's writes instead of persisting them to the host (verification/CI).",
    type: "boolean",
  },
} satisfies ArgsDef;
// `virrun run -- <cmd>` — the explicit form of the default passthrough, identical to the bare `virrun -- <cmd>`
// Prefix. On the os backend it forks a warm snapshot and flushes the command's produced files back to the host so
// Disk matches native (write-back, specs/write-back.md); `--ephemeral` keeps the warm fork but lets writes vanish
// (CI/verification where no output is wanted). Plain-execs on any other resolved backend.
export const runCommand: CommandDef<typeof runArgs> = defineCommand({
  args: runArgs,
  meta: {
    description: "Run a command in the sandbox (warm snapshot; persists produced files to the host on the os backend).",
    name: "run",
  },
  run: ({ args, cmd }) => runPassthrough(args._, cmd, args.ephemeral ? ExecutionMode.Fork : ExecutionMode.Persist),
});
