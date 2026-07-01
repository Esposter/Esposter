import type { RunArgs } from "@/models/cli/RunArgs";
import type { ArgsDef, CommandDef } from "citty";

import { CommandType } from "@/models/virrun/CommandType";
import { ExecutionMode } from "@/models/virrun/ExecutionMode";
import { runPassthrough } from "@/services/cli/runPassthrough";
import { VIRRUN_NO_CACHE_KEY } from "@/services/exec/util/constants";
import { defineCommand } from "citty";
import dedent from "dedent";

const runArgs: RunArgs = {
  cache: {
    default: true,
    description: "Reuse the task cache for an unchanged persist run (`--no-cache` forces real execution).",
    type: "boolean",
  },
  ephemeral: {
    default: false,
    description: "Discard the command's writes instead of persisting them to the host (verification/CI).",
    type: "boolean",
  },
} satisfies ArgsDef;
// `--no-cache` is surfaced via the VIRRUN_NO_CACHE env (what isTaskCacheEnabled reads) rather than threaded through
// The Virrun handle, keeping persist's signature small.
export const runCommand: CommandDef<RunArgs> = defineCommand({
  args: runArgs,
  meta: {
    description: dedent`
      Run an executable in the sandbox — warm snapshot, persists produced files to the host on the os backend.
      The command is a binary + args, not a package script: \`virrun run -- pnpm test\`, not \`virrun run test\`.
    `,
    name: CommandType.Run,
  },
  run: ({ args, cmd }) => {
    if (!args.cache) process.env[VIRRUN_NO_CACHE_KEY] = "true";
    return runPassthrough(args._, cmd, args.ephemeral ? ExecutionMode.Fork : ExecutionMode.Persist);
  },
});
