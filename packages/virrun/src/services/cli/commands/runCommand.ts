import type { RunArgs } from "#src/models/cli/RunArgs";
import type { ArgsDef, CommandDef } from "citty";

import { CommandType } from "#src/models/virrun/CommandType";
import { ExecutionMode } from "#src/models/virrun/ExecutionMode";
import { runPassthrough } from "#src/services/cli/run/runPassthrough";
import { VIRRUN_DEBUG_KEY, VIRRUN_NO_CACHE_KEY } from "#src/services/exec/util/constants";
import { defineCommand } from "citty";
import dedent from "dedent";

const runArgs: RunArgs = {
  cache: {
    default: true,
    description: "Reuse the task cache for an unchanged persist run (`--no-cache` forces real execution).",
    type: "boolean",
  },
  debug: {
    default: false,
    description: "Print internal diagnostic lines to stderr (e.g. why a run was not cached).",
    type: "boolean",
  },
  ephemeral: {
    default: false,
    description: "Discard the command's writes instead of persisting them to the host (verification/CI).",
    type: "boolean",
  },
} satisfies ArgsDef;
// `--no-cache`/`--debug` are surfaced via the VIRRUN_NO_CACHE/VIRRUN_DEBUG envs (what checkIsTaskCacheEnabled and
// WriteVirrunDebug read) rather than threaded through the Virrun handle, keeping persist's signature small.
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
    if (args.debug) process.env[VIRRUN_DEBUG_KEY] = "true";
    return runPassthrough(args._, cmd, args.ephemeral ? ExecutionMode.Fork : ExecutionMode.Persist);
  },
});
