import type { CommandDef } from "citty";

import { CommandType } from "@/models/virrun/CommandType";
import { cacheCommand } from "@/services/cli/commands/cacheCommand";
import { execCommand } from "@/services/cli/commands/execCommand";
import { initCommand } from "@/services/cli/commands/initCommand";
import { runCommand } from "@/services/cli/commands/runCommand";
import { snapshotCommand } from "@/services/cli/commands/snapshotCommand";
import { defineCommand } from "citty";
// The root command. `default: CommandType.Run` makes the bare `virrun -- <cmd>` prefix dispatch to the `run` subcommand —
// Citty's default-subcommand mechanism, used instead of an own `run` because citty 0.2.2 runs a parent's `run`
// *In addition to* a matched subcommand, which would fire the passthrough after every `init`/`cache`/… call. A
// Leading `--` is never matched as a subcommand name (findSubCommandIndex returns -1), so the prefix form always
// Falls to the default `run`; `run`/`exec`/`snapshot`/`init`/`cache` dispatch by their leading token. The command
// After `--` reaches run as citty's positional rest (`args._`), forwarded as an argv array (shell: false) so
// Argument boundaries and metacharacters survive instead of being re-tokenized by a shell.
export const mainCommand: CommandDef = defineCommand({
  default: CommandType.Run,
  meta: {
    description: "Run a repo's real toolchain fast and isolated. `virrun -- <cmd>` sandboxes any command.",
    name: "virrun",
  },
  subCommands: {
    [CommandType.Cache]: cacheCommand,
    [CommandType.Exec]: execCommand,
    [CommandType.Init]: initCommand,
    [CommandType.Run]: runCommand,
    [CommandType.Snapshot]: snapshotCommand,
  },
});
